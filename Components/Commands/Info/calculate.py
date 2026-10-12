import discord
from discord.ext import commands
import ast
import operator
import math

try:
    from discord.ui import Button, Container, TextDisplay, ActionRow, LayoutView
    HAS_V2 = True
except ImportError:
    HAS_V2 = False
    LayoutView = discord.ui.View
    Container = None
    TextDisplay = None
    ActionRow = None

def resolve_color(val) -> discord.Color:
    if isinstance(val, discord.Color):
        return val
    if isinstance(val, int):
        return discord.Color(val)
    if isinstance(val, str):
        val = val.strip().lstrip("#")
        try:
            return discord.Color(int(val, 16))
        except ValueError:
            pass
    return discord.Color(0x5865F2)

def safe_eval(expr: str):
    clean_expr = (
        expr.replace("÷", "/")
        .replace("x", "*")
        .replace("×", "*")
        .replace("^", "**")
        .strip()
    )
    if not clean_expr:
        return "Waiting..."

    if clean_expr.endswith(("+", "-", "*", "/", "%", "**", "(")):
        return "Waiting..."

    open_parens = clean_expr.count("(")
    close_parens = clean_expr.count(")")
    if open_parens > close_parens:
        test_expr = clean_expr + (")" * (open_parens - close_parens))
    else:
        test_expr = clean_expr

    allowed_operators = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow,
        ast.Mod: operator.mod,
        ast.USub: operator.neg,
        ast.UAdd: operator.pos,
        ast.BitXor: operator.xor,
    }

    def eval_node(node):
        if isinstance(node, ast.Constant):
            if isinstance(node.value, (int, float)):
                return node.value
            raise TypeError("Only numbers are allowed")
        elif isinstance(node, ast.BinOp):
            left = eval_node(node.left)
            right = eval_node(node.right)
            op_type = type(node.op)
            if op_type in allowed_operators:
                if op_type is ast.Pow and isinstance(right, (int, float)) and right > 1000:
                    raise ValueError("Exponent too large")
                return allowed_operators[op_type](left, right)
            raise ValueError(f"Unsupported operator: {node.op}")
        elif isinstance(node, ast.UnaryOp):
            operand = eval_node(node.operand)
            op_type = type(node.op)
            if op_type in allowed_operators:
                return allowed_operators[op_type](operand)
            raise ValueError(f"Unsupported operator: {node.op}")
        elif isinstance(node, ast.Expression):
            return eval_node(node.body)
        else:
            raise TypeError(f"Unsupported expression: {node}")

    try:
        parsed = ast.parse(test_expr, mode='eval')
        result = eval_node(parsed)
        if isinstance(result, float) and result.is_integer():
            return str(int(result))
        elif isinstance(result, float):
            return str(round(result, 6))
        return str(result)
    except ZeroDivisionError:
        return "Cannot divide by 0"
    except SyntaxError:
        return "Waiting..."
    except Exception as e:
        print(f"[Calculator] Evaluation error for '{expr}': {e}")
        return "Error"

def build_calculator_body(expression: str, result: str, timed_out: bool = False) -> str:
    expr_display = expression if expression else "0"
    res_display = result if result else "Waiting..."

    lines = [
        "# Calculator!\n",
        f"**Expression**\n`{expr_display}`\n",
        f"**Result**\n`{res_display}`"
    ]
    if timed_out:
        lines.append("\n**Status**\nSession ended (Timed out)")
    return "\n".join(lines).strip()

class CalculatorLayoutView(LayoutView):
    def __init__(self, user: discord.User, color: discord.Color = None):
        super().__init__(timeout=180)
        self.user = user
        self.color = color or discord.Color(0x5865F2)
        self.expression = ""
        self.result = "Waiting..."
        self.message = None
        self.build_ui(disabled=False)

    def build_ui(self, disabled: bool = False):
        self.clear_items()

        def make_btn(label: str, style: discord.ButtonStyle):
            b = Button(label=label, style=style, disabled=disabled)
            async def cb(interaction: discord.Interaction):
                await self.handle_button_press(interaction, label)
            b.callback = cb
            return b

        r0 = ActionRow(
            make_btn("7", discord.ButtonStyle.secondary),
            make_btn("8", discord.ButtonStyle.secondary),
            make_btn("9", discord.ButtonStyle.secondary),
            make_btn("÷", discord.ButtonStyle.primary),
            make_btn("AC", discord.ButtonStyle.danger),
        )
        r1 = ActionRow(
            make_btn("4", discord.ButtonStyle.secondary),
            make_btn("5", discord.ButtonStyle.secondary),
            make_btn("6", discord.ButtonStyle.secondary),
            make_btn("x", discord.ButtonStyle.primary),
            make_btn("⌫", discord.ButtonStyle.danger),
        )
        r2 = ActionRow(
            make_btn("1", discord.ButtonStyle.secondary),
            make_btn("2", discord.ButtonStyle.secondary),
            make_btn("3", discord.ButtonStyle.secondary),
            make_btn("-", discord.ButtonStyle.primary),
            make_btn("()", discord.ButtonStyle.primary),
        )
        r3 = ActionRow(
            make_btn("0", discord.ButtonStyle.secondary),
            make_btn(".", discord.ButtonStyle.secondary),
            make_btn("=", discord.ButtonStyle.success),
            make_btn("+", discord.ButtonStyle.primary),
            make_btn("^", discord.ButtonStyle.primary),
        )

        accent = self.color if not disabled else discord.Color.dark_gray()
        body = build_calculator_body(self.expression, self.result, timed_out=disabled)

        container = Container(
            TextDisplay(content=body),
            r0, r1, r2, r3,
            accent_color=accent
        )
        self.add_item(container)
        self.add_item(TextDisplay(content=f"-# Requested by {self.user.display_name} • Interactive Calculator"))

    async def interaction_check(self, interaction: discord.Interaction) -> bool:
        if interaction.user.id != self.user.id:
            await interaction.response.send_message(
                "You cannot use this calculator session. Start your own with `/calculate`!",
                ephemeral=True
            )
            return False
        return True

    async def handle_button_press(self, interaction: discord.Interaction, label: str):
        if interaction.user.id != self.user.id:
            return await interaction.response.send_message(
                "You cannot use this calculator session. Start your own with `/calculate`!",
                ephemeral=True
            )

        if label == "AC":
            self.expression = ""
            self.result = "Waiting..."
        elif label == "⌫":
            self.expression = self.expression[:-1]
            self.result = safe_eval(self.expression) if self.expression else "Waiting..."
        elif label == "=":
            eval_res = safe_eval(self.expression)
            self.result = eval_res
            if eval_res not in ("Error", "Waiting...", "Cannot divide by 0"):
                self.expression = eval_res
        elif label == "()":
            open_count = self.expression.count("(")
            close_count = self.expression.count(")")
            if open_count > close_count:
                self.expression += ")"
            else:
                self.expression += "("
            self.result = safe_eval(self.expression)
        else:
            if len(self.expression) >= 100:
                return await interaction.response.send_message("Expression is too long!", ephemeral=True)
            self.expression += label
            self.result = safe_eval(self.expression)

        self.build_ui(disabled=False)
        try:
            await interaction.response.edit_message(view=self)
        except Exception as e:
            print(f"[Calculator] LayoutView update error: {e}")

    async def on_timeout(self):
        self.build_ui(disabled=True)
        try:
            if hasattr(self, 'message') and self.message:
                await self.message.edit(view=self)
        except Exception:
            pass


class ClassicCalculatorButton(discord.ui.Button):
    def __init__(self, label: str, style: discord.ButtonStyle, row: int):
        super().__init__(label=label, style=style, row=row)

    async def callback(self, interaction: discord.Interaction):
        view: ClassicCalculatorView = self.view
        await view.handle_button_press(interaction, self.label)


class ClassicCalculatorView(discord.ui.View):
    def __init__(self, user: discord.User, color: discord.Color = None):
        super().__init__(timeout=180)
        self.user = user
        self.color = color or discord.Color(0x5865F2)
        self.expression = ""
        self.result = "Waiting..."
        self.message = None
        self._setup_buttons()

    def _setup_buttons(self, disabled: bool = False):
        self.clear_items()
        buttons = [
            ("7", discord.ButtonStyle.secondary, 0), ("8", discord.ButtonStyle.secondary, 0), ("9", discord.ButtonStyle.secondary, 0), ("÷", discord.ButtonStyle.primary, 0), ("AC", discord.ButtonStyle.danger, 0),
            ("4", discord.ButtonStyle.secondary, 1), ("5", discord.ButtonStyle.secondary, 1), ("6", discord.ButtonStyle.secondary, 1), ("x", discord.ButtonStyle.primary, 1), ("⌫", discord.ButtonStyle.danger, 1),
            ("1", discord.ButtonStyle.secondary, 2), ("2", discord.ButtonStyle.secondary, 2), ("3", discord.ButtonStyle.secondary, 2), ("-", discord.ButtonStyle.primary, 2), ("()", discord.ButtonStyle.primary, 2),
            ("0", discord.ButtonStyle.secondary, 3), (".", discord.ButtonStyle.secondary, 3), ("=", discord.ButtonStyle.success, 3), ("+", discord.ButtonStyle.primary, 3), ("^", discord.ButtonStyle.primary, 3),
        ]
        for label, style, row in buttons:
            btn = ClassicCalculatorButton(label, style, row)
            btn.disabled = disabled
            self.add_item(btn)

    def build_embed(self, timed_out: bool = False) -> discord.Embed:
        color = self.color if not timed_out else discord.Color.dark_gray()
        embed = discord.Embed(title="Calculator!", color=color)
        expr_display = self.expression if self.expression else "0"
        res_display = self.result if self.result else "Waiting..."
        embed.add_field(name="Expression", value=f"`{expr_display}`", inline=False)
        embed.add_field(name="Result", value=f"`{res_display}`", inline=False)
        if timed_out:
            embed.add_field(name="Status", value="Session ended (Timed out)", inline=False)
        embed.set_footer(text=f"Requested by {self.user.display_name} • Interactive Calculator")
        return embed

    async def interaction_check(self, interaction: discord.Interaction) -> bool:
        if interaction.user.id != self.user.id:
            await interaction.response.send_message("You cannot use this calculator session. Start your own with `/calculate`!", ephemeral=True)
            return False
        return True

    async def handle_button_press(self, interaction: discord.Interaction, label: str):
        if label == "AC":
            self.expression = ""
            self.result = "Waiting..."
        elif label == "⌫":
            self.expression = self.expression[:-1]
            self.result = safe_eval(self.expression) if self.expression else "Waiting..."
        elif label == "=":
            eval_res = safe_eval(self.expression)
            self.result = eval_res
            if eval_res not in ("Error", "Waiting...", "Cannot divide by 0"):
                self.expression = eval_res
        elif label == "()":
            open_count = self.expression.count("(")
            close_count = self.expression.count(")")
            if open_count > close_count:
                self.expression += ")"
            else:
                self.expression += "("
            self.result = safe_eval(self.expression)
        else:
            if len(self.expression) >= 100:
                return await interaction.response.send_message("Expression is too long!", ephemeral=True)
            self.expression += label
            self.result = safe_eval(self.expression)

        embed = self.build_embed()
        await interaction.response.edit_message(embed=embed, view=self)

    async def on_timeout(self):
        self._setup_buttons(disabled=True)
        embed = self.build_embed(timed_out=True)
        try:
            if hasattr(self, 'message') and self.message:
                await self.message.edit(embed=embed, view=self)
        except Exception:
            pass


class CalculateCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(
        name="calculate",
        aliases=["calculator", "calc"],
        description="Opens an interactive calculator."
    )
    async def calculate(self, ctx: commands.Context):
        color_val = discord.Color(0x5865F2)

        if HAS_V2:
            try:
                view = CalculatorLayoutView(ctx.author, color=color_val)
                msg = await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
                view.message = msg
                return
            except Exception as e:
                print(f"[Calculator] LayoutView send failed ({e}), falling back to embed.")

        fallback_view = ClassicCalculatorView(ctx.author, color=color_val)
        embed = fallback_view.build_embed()
        msg = await ctx.send(embed=embed, view=fallback_view, allowed_mentions=discord.AllowedMentions.none())
        fallback_view.message = msg

async def setup(bot: commands.Bot):
    await bot.add_cog(CalculateCommand(bot))
