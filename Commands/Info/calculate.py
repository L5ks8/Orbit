import discord
from discord.ext import commands
import ast
import operator
import math

def safe_eval(expr: str):
    # safe evaluation of mathematical expressions
    expr = expr.replace("÷", "/").replace("x", "*").replace("^", "**")
    
    allowed_operators = {
        ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
        ast.Div: operator.truediv, ast.Pow: operator.pow, ast.BitXor: operator.xor,
        ast.USub: operator.neg, ast.Mod: operator.mod
    }

    def eval_node(node):
        if isinstance(node, ast.Num): # <number>
            return node.n
        elif isinstance(node, ast.BinOp): # <left> <operator> <right>
            left = eval_node(node.left)
            right = eval_node(node.right)
            if node.op.__class__ in allowed_operators:
                return allowed_operators[node.op.__class__](left, right)
            raise ValueError(f"Unsupported operator: {node.op}")
        elif isinstance(node, ast.UnaryOp): # <operator> <operand> e.g., -1
            operand = eval_node(node.operand)
            if node.op.__class__ in allowed_operators:
                return allowed_operators[node.op.__class__](operand)
            raise ValueError(f"Unsupported operator: {node.op}")
        elif isinstance(node, ast.Expression):
            return eval_node(node.body)
        elif isinstance(node, ast.Constant):
            return node.value
        else:
            raise TypeError(f"Unsupported expression: {node}")

    try:
        if not expr.strip():
            return "Waiting..."
        parsed = ast.parse(expr, mode='eval')
        result = eval_node(parsed)
        if isinstance(result, float) and result.is_integer():
            return str(int(result))
        return str(round(result, 4))
    except Exception:
        return "Error"

class CalculatorButton(discord.ui.Button):
    def __init__(self, label: str, style: discord.ButtonStyle, row: int):
        super().__init__(label=label, style=style, row=row)

    async def callback(self, interaction: discord.Interaction):
        view: CalculatorView = self.view
        
        if self.label == "AC":
            view.expression = ""
            view.result = "Waiting..."
        elif self.label == "⌫":
            view.expression = view.expression[:-1]
            view.result = safe_eval(view.expression) if view.expression else "Waiting..."
        elif self.label == "=":
            view.expression = safe_eval(view.expression)
            view.result = "Waiting..."
        elif self.label == "()":
            # Count open and closed parens to decide which to add
            open_count = view.expression.count("(")
            close_count = view.expression.count(")")
            if open_count > close_count:
                view.expression += ")"
            else:
                view.expression += "("
            view.result = safe_eval(view.expression)
        else:
            view.expression += self.label
            view.result = safe_eval(view.expression)
            
        await view.update_message(interaction)

class CalculatorView(discord.ui.View):
    def __init__(self, user: discord.User):
        super().__init__(timeout=180)
        self.user = user
        self.expression = ""
        self.result = "Waiting..."
        
        # Row 1
        self.add_item(CalculatorButton("7", discord.ButtonStyle.secondary, 0))
        self.add_item(CalculatorButton("8", discord.ButtonStyle.secondary, 0))
        self.add_item(CalculatorButton("9", discord.ButtonStyle.secondary, 0))
        self.add_item(CalculatorButton("÷", discord.ButtonStyle.primary, 0))
        self.add_item(CalculatorButton("AC", discord.ButtonStyle.danger, 0))
        
        # Row 2
        self.add_item(CalculatorButton("4", discord.ButtonStyle.secondary, 1))
        self.add_item(CalculatorButton("5", discord.ButtonStyle.secondary, 1))
        self.add_item(CalculatorButton("6", discord.ButtonStyle.secondary, 1))
        self.add_item(CalculatorButton("x", discord.ButtonStyle.primary, 1))
        self.add_item(CalculatorButton("⌫", discord.ButtonStyle.danger, 1))
        
        # Row 3
        self.add_item(CalculatorButton("1", discord.ButtonStyle.secondary, 2))
        self.add_item(CalculatorButton("2", discord.ButtonStyle.secondary, 2))
        self.add_item(CalculatorButton("3", discord.ButtonStyle.secondary, 2))
        self.add_item(CalculatorButton("-", discord.ButtonStyle.primary, 2))
        self.add_item(CalculatorButton("()", discord.ButtonStyle.primary, 2))
        
        # Row 4
        self.add_item(CalculatorButton("0", discord.ButtonStyle.secondary, 3))
        self.add_item(CalculatorButton(".", discord.ButtonStyle.secondary, 3))
        self.add_item(CalculatorButton("=", discord.ButtonStyle.success, 3))
        self.add_item(CalculatorButton("+", discord.ButtonStyle.primary, 3))
        self.add_item(CalculatorButton("^", discord.ButtonStyle.primary, 3))

    async def interaction_check(self, interaction: discord.Interaction) -> bool:
        if interaction.user != self.user:
            await interaction.response.send_message("You cannot use this calculator.", ephemeral=True)
            return False
        return True

    async def on_timeout(self):
        for child in self.children:
            child.disabled = True
            
        embed = discord.Embed(
            title="Calculator Session Ended", 
            description="This calculator has timed out. Use `/calculate` to start a new session.",
            color=discord.Color.dark_gray()
        )
        embed.add_field(name="Final Expression", value=f"`{self.expression}`" if self.expression else "`Empty`", inline=False)
        embed.add_field(name="Final Result", value=f"`{self.result}`", inline=False)
        embed.set_footer(text=f"Requested by {self.user.name}")
        
        try:
            if hasattr(self, 'message') and self.message:
                await self.message.edit(embed=embed, view=None)
        except Exception:
            pass

    async def update_message(self, interaction: discord.Interaction):
        embed = discord.Embed(
            title="Interactive Calculator", 
            description="Use the buttons below to build your expression.", 
            color=discord.Color.orange()
        )
        embed.add_field(name="Expression", value=f"`{self.expression}`" if self.expression else "`Empty`", inline=False)
        embed.add_field(name="Result", value=f"`{self.result}`", inline=False)
        embed.set_footer(text=f"Requested by {self.user.name}")
        await interaction.response.edit_message(embed=embed, view=self)


class CalculateCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="calculate", description="Opens an interactive calculator.")
    async def calculate(self, ctx: commands.Context):
        view = CalculatorView(ctx.author)
        embed = discord.Embed(
            title="Interactive Calculator", 
            description="Use the buttons below to build your expression.", 
            color=discord.Color.orange()
        )
        embed.add_field(name="Expression", value="`Empty`", inline=False)
        embed.add_field(name="Result", value="`Waiting...`", inline=False)
        embed.set_footer(text=f"Requested by {ctx.author.name}")
        
        msg = await ctx.send(embed=embed, view=view)
        view.message = msg

async def setup(bot: commands.Bot):
    await bot.add_cog(CalculateCommand(bot))
