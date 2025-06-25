// Configuración de categorías para proyectos y tareas
export const PROJECT_CATEGORIES = {
  "gestion-administrativa": {
    id: "gestion-administrativa",
    name: "Gestión Administrativa",
    color: "#6366f1", // Indigo
    colorLight: "#e0e7ff",
    emoji: "📋"
  },
  "booking-fechas": {
    id: "booking-fechas", 
    name: "Booking & Fechas",
    color: "#8b5cf6", // Violet
    colorLight: "#ede9fe",
    emoji: "📅"
  },
  "produccion-musical": {
    id: "produccion-musical",
    name: "Producción Musical", 
    color: "#06b6d4", // Cyan
    colorLight: "#cffafe",
    emoji: "🎵"
  },
  "produccion-audiovisual": {
    id: "produccion-audiovisual",
    name: "Producción Audiovisual",
    color: "#84cc16", // Lime
    colorLight: "#ecfccb", 
    emoji: "🎬"
  },
  "comunicacion-prensa": {
    id: "comunicacion-prensa",
    name: "Comunicación & Prensa",
    color: "#eab308", // Yellow
    colorLight: "#fefce8",
    emoji: "📰"
  },
  "marketing-promocion": {
    id: "marketing-promocion", 
    name: "Marketing & Promoción",
    color: "#f97316", // Orange
    colorLight: "#fff7ed",
    emoji: "📈"
  },
  "redes-sociales": {
    id: "redes-sociales",
    name: "Redes Sociales & Contenido Digital",
    color: "#ec4899", // Pink
    colorLight: "#fdf2f8",
    emoji: "📱"
  },
  "diseno-branding": {
    id: "diseno-branding",
    name: "Diseño & Branding", 
    color: "#8b5cf6", // Purple
    colorLight: "#f3e8ff",
    emoji: "🎨"
  },
  "gira-logistica": {
    id: "gira-logistica",
    name: "Gira & Logística",
    color: "#059669", // Emerald
    colorLight: "#d1fae5",
    emoji: "🚌"
  },
  "desarrollo-profesional": {
    id: "desarrollo-profesional",
    name: "Desarrollo Profesional",
    color: "#0891b2", // Sky
    colorLight: "#e0f2fe", 
    emoji: "📚"
  },
  "merchandising": {
    id: "merchandising",
    name: "Merchandising",
    color: "#dc2626", // Red
    colorLight: "#fef2f2",
    emoji: "👕"
  },
  "relaciones-institucionales": {
    id: "relaciones-institucionales", 
    name: "Relaciones Institucionales & Fondos",
    color: "#7c3aed", // Violet
    colorLight: "#f5f3ff",
    emoji: "🏛️"
  }
};

// Funciones utilitarias para trabajar con categorías
export const getCategoryById = (categoryId) => {
  return PROJECT_CATEGORIES[categoryId] || null;
};

export const getCategoryColor = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.color : "#6b7280"; // Gray por defecto
};

export const getCategoryLightColor = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.colorLight : "#f3f4f6"; // Light gray por defecto
};

export const getCategoryName = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.name : "Sin categoría";
};

export const getCategoryEmoji = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.emoji : "📁";
};

// Array de todas las categorías para selects/dropdowns
export const CATEGORIES_ARRAY = Object.values(PROJECT_CATEGORIES);

// Funciones para generar estilos CSS
export const getCategoryStyles = (categoryId) => {
  const category = getCategoryById(categoryId);
  if (!category) return {};
  
  return {
    backgroundColor: category.color,
    color: "white",
    border: `1px solid ${category.color}`
  };
};

export const getCategoryLightStyles = (categoryId) => {
  const category = getCategoryById(categoryId);
  if (!category) return {};
  
  return {
    backgroundColor: category.colorLight,
    color: category.color,
    border: `1px solid ${category.color}33` // 20% opacity
  };
};
