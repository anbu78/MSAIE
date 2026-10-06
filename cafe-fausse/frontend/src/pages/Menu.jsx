import menu from '../data/menu';
import './Menu.css';

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function Menu() {
  return (
    <div className="menu-page">
      <section className="section">
        <div className="container section__header">
          <p className="section__eyebrow">Our Menu</p>
          <h1>Crafted Dishes, Timeless Flavors</h1>
          <p>Every dish is prepared with fresh, locally sourced ingredients.</p>
        </div>

        <div className="container">
          {menu.map((group) => (
            <div key={group.category} className="menu-category">
              <h2 className="menu-category__title">{group.category}</h2>
              <ul className="menu-list">
                {group.items.map((item) => (
                  <li key={item.name} className="menu-item">
                    <div className="menu-item__row">
                      <h3 className="menu-item__name">{item.name}</h3>
                      <span className="menu-item__price">{formatPrice(item.price)}</span>
                    </div>
                    <p className="menu-item__description">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Menu;
