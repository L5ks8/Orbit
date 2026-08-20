import React from 'react';

export default function DiscordEmbed({ 
  color = '#5865F2', 
  title, 
  description, 
  fields = [], 
  thumbnail, 
  image, 
  footer, 
  author,
  buttons = [],
  selectMenu
}) {
  return (
    <div style={{ maxWidth: '450px', marginBottom: '32px', fontFamily: '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      
      {/* Embed Card */}
      <div style={{
        backgroundColor: '#2b2d31',
        borderLeft: `4px solid ${color}`,
        borderRadius: '4px',
        padding: '16px',
        color: '#dcddde',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        
        {/* Author */}
        {author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {author.icon && <img src={author.icon} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{author.name}</span>
          </div>
        )}

        {/* Content Row (Title/Desc + Thumbnail) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Title */}
            {title && (
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                {title}
              </div>
            )}

            {/* Description */}
            {description && (
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                {description}
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {thumbnail && (
            <img src={thumbnail} alt="" style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
          )}

        </div>

        {/* Fields */}
        {fields.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
            {fields.map((field, idx) => (
              <div key={idx} style={{ 
                flex: field.inline ? '1 1 45%' : '1 1 100%', 
                minWidth: field.inline ? '150px' : '100%' 
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{field.name}</div>
                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{field.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Image */}
        {image && (
          <img src={image} alt="" style={{ width: '100%', borderRadius: '4px', marginTop: '8px', objectFit: 'cover' }} />
        )}

        {/* Footer */}
        {footer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            {footer.icon && <img src={footer.icon} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
            <span style={{ fontSize: '12px', color: '#949ba4' }}>{footer.text}</span>
          </div>
        )}
      </div>

      {/* Message Components (Select Menus / Buttons) */}
      {(selectMenu || buttons.length > 0) && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {selectMenu && (
            <div style={{
              backgroundColor: '#1e1f22',
              border: '1px solid #1e1f22',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#dbdee1',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'not-allowed',
              opacity: 0.9
            }}>
              {selectMenu.placeholder}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          )}

          {buttons.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {buttons.map((btn, idx) => (
                <div key={idx} style={{
                  backgroundColor: btn.style === 'success' ? '#248046' : btn.style === 'danger' ? '#da373c' : btn.style === 'primary' ? '#5865F2' : '#4e5058',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '8px 16px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'not-allowed'
                }}>
                  {btn.emoji && <span>{btn.emoji}</span>}
                  {btn.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
