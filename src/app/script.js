// Funcionalidad del buscador
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const categoryCards = document.querySelectorAll('.category-card');
  
  // Función para filtrar categorías
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    categoryCards.forEach(card => {
      const title = card.querySelector('.category-title').textContent.toLowerCase();
      const subtitle = card.querySelector('.category-subtitle').textContent.toLowerCase();
      const category = card.getAttribute('data-category') || '';
      
      // Verificar si el término de búsqueda coincide con el título, subtítulo o categoría
      if (title.includes(searchTerm) || 
          subtitle.includes(searchTerm) || 
          category.includes(searchTerm)) {
        card.classList.remove('hidden');
        // Animación de entrada
        card.style.animation = 'fadeIn 0.3s ease-in';
      } else {
        card.classList.add('hidden');
      }
    });
    
    // Si el campo está vacío, mostrar todas las categorías
    if (searchTerm === '') {
      categoryCards.forEach(card => {
        card.classList.remove('hidden');
      });
    }
  });
  
  // Limpiar búsqueda con tecla Escape
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      this.value = '';
      categoryCards.forEach(card => {
        card.classList.remove('hidden');
      });
      this.blur();
    }
  });
});

// Animación CSS para fadeIn
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);