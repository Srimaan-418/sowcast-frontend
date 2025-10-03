// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [advice, setAdvice] = useState('');

  // This effect runs whenever the prediction changes
  useEffect(() => {
    if (prediction) {
      if (prediction.predicted_rain === 1) {
        setAdvice("Rain is expected. No need to water the plants today. 🌱");
      } else {
        setAdvice("No rain expected. You should consider watering the plants. 💧");
      }
    }
  }, [prediction]);

  const getPrediction = async () => {
    const todayWeather = {
      "tempmax": 28.0, "tempmin": 22.0, "humidity": 80.0, "precip": 0.0
    };
    setLoading(true);
    setError('');
    setPrediction(null);
    setAdvice('');

    try {
      const response = await axios.post('https://sowcast-api.onrender.com/predict', todayWeather);
      setPrediction(response.data); // Set the entire prediction object
    } catch (err) {
      setError('Could not connect to the prediction server. Is it running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="weather-card">
        <h1>Agri-Predict</h1>
        <p className="subtitle">Daily forecast and watering advice for your crops.</p>
        
        <button onClick={getPrediction} disabled={loading}>
          {loading ? 'Analyzing...' : 'Get Next Day\'s Forecast'}
        </button>

        {error && <p className="error">{error}</p>}

        {prediction && (
          <div className="results">
            <div className="result-item">
              <span>Next Day's Max Temp</span>
              <p>{prediction.predicted_max_temp.toFixed(1)}°C</p>
            </div>
            <div className="result-item">
              <span>Rain Expected?</span>
              <p>{prediction.predicted_rain === 1 ? 'Yes 🌧️' : 'No ☀️'}</p>
            </div>
          </div>
        )}
        
        {advice && (
          <div className="advice">
            <h3>Recommendation:</h3>
            <p>{advice}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
