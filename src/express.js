const express=require('express');
const app=express();
const cors = require('cors');
const cookieparser=require('cookie-parser');
const ruleRoutes=require('../src/routers/ruleRoutes')
const weatherRoutes=require('../src/routers/weatherRoutes')
const errorMiddleware=require('./errorHandling/errorMiddleware')
const cron = require('node-cron');
const weatherCtrl=require('./controllers/weatherCtrl');
app.use(express.json());
app.use(cookieparser())
app.use(express.urlencoded({extended:true}));
app.use(cors())
cron.schedule('0 * * * *', weatherCtrl.fetchWeatherData);
cron.schedule('0 0 * * *', weatherCtrl.getDailySummaries);
cron.schedule('*/5 * * * *', weatherCtrl.checkThresholds);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/rule', ruleRoutes);
// console.log()
app.use('/api/v1',ruleRoutes);
app.use('/*',(req,res)=>{
    console.log(req.body);
    res.status(200).json({
        success:true,
        message:'wrong url'
    })
});


app.use(errorMiddleware);
module.exports= app
