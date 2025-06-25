import { 
  getCategoryColor, 
  getCategoryLightColor, 
  getCategoryName, 
  getCategoryEmoji 
} from "../utils/categories";

export default function CategoryBadge({ 
  categoryId, 
  variant = "solid", 
  size = "medium",
  showEmoji = true,
  style = {}
}) {
  if (!categoryId) return null;

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: variant === "text" ? 4 : 6,
    borderRadius: variant === "text" ? 0 : (size === "small" ? 12 : 16),
    fontWeight: variant === "text" ? 500 : 600,
    whiteSpace: 'nowrap'
  };

  const sizeStyles = {
    small: {
      padding: variant === "text" ? 0 : '4px 8px',
      fontSize: 11
    },
    medium: {
      padding: variant === "text" ? 0 : '6px 12px',
      fontSize: 12
    },
    large: {
      padding: variant === "text" ? 0 : '8px 16px',
      fontSize: 14
    }
  };

  const variantStyles = {
    solid: {
      backgroundColor: getCategoryColor(categoryId),
      color: 'white',
      border: `1px solid ${getCategoryColor(categoryId)}`
    },
    light: {
      backgroundColor: getCategoryLightColor(categoryId),
      color: getCategoryColor(categoryId),
      border: `1px solid ${getCategoryColor(categoryId)}33`
    },
    outline: {
      backgroundColor: 'transparent',
      color: getCategoryColor(categoryId),
      border: `1px solid ${getCategoryColor(categoryId)}`
    },
    text: {
      backgroundColor: 'transparent',
      color: getCategoryColor(categoryId),
      border: 'none'
    }
  };

  const finalStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style
  };

  return (
    <span style={finalStyles}>
      {showEmoji && (
        <span>{getCategoryEmoji(categoryId)}</span>
      )}
      <span>{getCategoryName(categoryId)}</span>
    </span>
  );
}
