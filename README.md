# ✈️ Tripmind — AI-Powered Trip Planner

> **Plan smarter, travel better.**  
> Tripmind is an intelligent travel planning web app powered by Google's Gemini AI. Enter your destination, budget, and interests — and get a fully personalized trip plan in seconds.

---

## 🌟 Features

- 🤖 **AI-Generated Trip Plans** — Powered by Gemini 2.5 Flash for rich, detailed itineraries
- 📍 **Destination-Specific Recommendations** — Top 10 places to visit, tailored to your interests
- 💰 **Budget-Aware Suggestions** — Accommodation, food, and activity recommendations across 4 budget tiers
- 🎒 **Interest Filtering** — Choose from 12 interest categories (Adventure, Beach, Culture, Food, Nature, and more)
- 📅 **Flexible Trip Durations** — Weekend getaways to long vacations (15+ days)
- 🎙️ **Voice Input** — Speak your destination using the built-in voice recognition button
- 🍽️ **Local Food & Restaurant Tips** — Must-try dishes and dining recommendations
- 💡 **Pro Travel Tips** — Insider advice specific to your destination
- 🌐 **Responsive UI** — Clean glassmorphism design with animated background

---

## 🗂️ Project Structure

```
prrr/
├── sunil/
│   ├── server.js          # Express backend — API proxy for Gemini
│   ├── package.json       # Node.js project config & dependencies
│   └── public/
│       ├── index.html     # Main frontend UI
│       ├── script.js      # Frontend logic (form handling, API calls, rendering)
│       └── styles.css     # Glassmorphism UI styles & animations
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kanha12042004/trip_mind.git
   cd trip_mind/sunil
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set your Gemini API Key**

   Set the environment variable before starting the server:

   **Windows (PowerShell):**
   ```powershell
   $env:GEMINI_API_KEY = "your_api_key_here"
   ```

   **macOS / Linux (bash):**
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

   > If port 3000 is busy, the server auto-tries ports 3001, 3002, 3003.

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | HTML5, Vanilla CSS, JavaScript      |
| Backend    | Node.js, Express.js                 |
| AI Engine  | Google Gemini 2.5 Flash API         |
| HTTP       | node-fetch                          |
| Fonts      | Google Fonts — Inter                |

---

## 🧠 How It Works

1. User fills in the trip planning form (destination, budget, interests, duration)
2. The frontend sends a `POST` request to `/api/plan-trip` on the backend
3. The Express server builds a detailed prompt and calls the **Gemini 2.5 Flash** API
4. The AI returns a structured trip plan with places, activities, food, stay options & budget breakdown
5. The frontend renders the response in a beautiful, formatted card

---

## 💳 Budget Tiers

| Tier     | Estimated Daily Budget |
|----------|------------------------|
| 🎒 Budget   | $50 – $100 / day      |
| 🧳 Moderate | $100 – $200 / day     |
| 💎 Premium  | $200 – $400 / day     |
| 👑 Luxury   | $400+ / day           |

---

## 🎯 Interest Categories

Adventure · Beach · Culture & History · Food & Culinary · Nature & Wildlife · Nightlife · Shopping · Photography · Spiritual & Wellness · Sports · Art & Museums · Romance & Honeymoon

---

## 🔐 Environment Variables

| Variable          | Description                        | Required |
|-------------------|------------------------------------|----------|
| `GEMINI_API_KEY`  | Your Google Gemini API key         | ✅ Yes   |
| `PORT`            | Port to run the server on (default: 3000) | ❌ No |

---

## 📸 Screenshots

> Coming soon — feel free to add screenshots of the UI here.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sunil**  
Powered by Sunil AI ✨  
> *Plan smarter, travel better.*
