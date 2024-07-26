const Weather=require('../models/weatherModel')
const WeatherSummary=require('../models/weatherSummaryModel')
const express=require('express');
const mongoose =require('mongoose') ;
const catchAsyncError=require('../errorHandling/catchAsyncError');
const errorHandler = require('../errorHandling/customErrorHandler');
const paginationFeature=require('../utils/paginationFeature')
const cron = require('node-cron');
const axios = require('axios');


const fetchSummary=catchAsyncError(async function(req,res){
    const summaries = await WeatherSummary.find();
    res.json(summaries);
})

const fetchAlert=catchAsyncError(async (req, res) => {
      const alerts = await Alert.find();
      res.json(alerts);
  })
// Function to fetch weather data
const fetchWeatherData =catchAsyncError(async () => {
    const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const url = 'http://api.openweathermap.org/data/2.5/weather';
  
    for (const city of cities) {
        const response = await axios.get(url, {
          params: {
            q: city,
            appid: process.env.OPENWEATHERMAP_API_KEY,
            units: 'metric', // Fetch data in Celsius
          },
        });
  
        const { main, weather, dt } = response.data;
        const newWeather = new Weather({
          city,
          main: weather[0].main,
          temp: main.temp,
          feels_like: main.feels_like,
          dt,
        });
  
        await newWeather.save();
        console.log(`Weather data for ${city} saved successfully`);
    }
  })
  
  const getDailySummaries = catchAsyncError(async () => {
    const summaries = await Weather.aggregate([
      {
        $group: {
          _id: {
            city: '$city',
            date: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: { $multiply: ["$dt", 1000] } } } }
          },
          avgTemp: { $avg: "$temp" },
          maxTemp: { $max: "$temp" },
          minTemp: { $min: "$temp" },
          dominantCondition: { $first: "$main" }
        }
      }
    ]);
  
    // Logic to determine dominant condition (most frequent)
    summaries.forEach(summary => {
      // Determine dominant weather condition here if needed
      // Example: Count occurrences and pick the most frequent
    });
  
    // Store summaries in MongoDB
    summaries.forEach(async (summary) => {
      await new WeatherSummary(summary).save();
    });
  })
  

  const checkThresholds = async () => {
    const alerts = [];
    const thresholds = { temperature: 35 }; // Example threshold
  
    const weatherData = await Weather.find().sort({ dt: -1 }).limit(12); // Last hour data (5 mins interval)
  
    weatherData.forEach(data => {
      if (data.temp > thresholds.temperature) {
        alerts.push({ city: data.city, message: `Temperature exceeded ${thresholds.temperature}°C` });
      }
    });
  
    // Logic to handle alerts (e.g., send email, display on console)
    alerts.forEach(alert => console.log(`Alert: ${alert.city} - ${alert.message}`));
  };

module.exports={fetchSummary,fetchAlert,fetchWeatherData,getDailySummaries,checkThresholds}