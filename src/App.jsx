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
    setLoading(true);
    setError('');
    setPrediction(null);
    setAdvice('');

    const OWM_API_KEY = "0167f9a60c197f048065eec7daa7e695"; // Your API Key
    const city = "Hyderabad";
    
    try {
      // STEP 1: Fetch TODAY'S live weather from OpenWeatherMap
      const liveWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OWM_API_KEY}&units=metric`
      );
      
      const liveData = liveWeatherResponse.data;
      
      // STEP 2: Prepare the live data for YOUR model
      const dataForModel = {
        "tempmax": liveData.main.temp_max,
        "tempmin": liveData.main.temp_min,
        "humidity": liveData.main.humidity,
        "precip": liveData.rain ? liveData.rain['1h'] || 0 : 0 // Precipitation in the last hour
      };

      // STEP 3: Send the LIVE data to your prediction API
      const predictionResponse = await axios.post(
        'https://sowcast-api.onrender.com/predict', // Your deployed API
        dataForModel
      );
      
      setPrediction(predictionResponse.data);

    } catch (err) {
      setError('Could not get prediction. Check the API key and server status.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="weather-card">
        <h1>SowCast</h1>
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
