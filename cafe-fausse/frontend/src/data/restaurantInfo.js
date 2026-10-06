// Central place for restaurant facts used across pages (SRS FR-2, FR-10, FR-11)
const restaurantInfo = {
  name: 'Café Fausse',
  address: '1234 Culinary Ave, Suite 100, Washington, DC 20002',
  phone: '(202) 555-4567',
  hours: [
    { days: 'Monday – Saturday', time: '5:00 PM – 11:00 PM' },
    { days: 'Sunday', time: '5:00 PM – 9:00 PM' },
  ],
  about:
    'Founded in 2010 by Chef Antonio Rossi and restaurateur Maria Lopez, Café Fausse ' +
    'blends traditional Italian flavors with modern culinary innovation. Our mission is ' +
    'to provide an unforgettable dining experience that reflects both quality and ' +
    'creativity.',
  founders: [
    {
      name: 'Chef Antonio Rossi',
      role: 'Executive Chef & Co-Founder',
      bio:
        'Trained in Florence and Bologna, Antonio brings two decades of experience ' +
        'crafting modern interpretations of classic Italian cuisine. His philosophy ' +
        'centers on honoring tradition while embracing creative, seasonal ingredients.',
    },
    {
      name: 'Maria Lopez',
      role: 'Restaurateur & Co-Founder',
      bio:
        'Maria oversees the guest experience and hospitality at Café Fausse, drawing ' +
        'on her background in fine-dining management to ensure every visit feels ' +
        'personal, warm, and memorable.',
    },
  ],
  commitment:
    'Café Fausse is committed to unforgettable dining, excellent food, and locally ' +
    'sourced ingredients — partnering with regional farms and purveyors to bring the ' +
    'freshest seasonal produce, meats, and seafood to every table.',
};

export default restaurantInfo;
