
import {ipKeyGenerator, rateLimit} from 'express-rate-limit';
import axios from 'axios';
import MongoStore from 'rate-limit-mongo'
import {getCountryCode} from '../Utils/countries.utils.js'






export const limiter = rateLimit({
  windowMs:15 * 60 * 1000,
  max:async function (req) {
    const {country_code} = await getCountryCode(req.headers['x-forwarded-for'])
    if(country_code=='US') return 20;
    if(country_code=='IN') return 10;
    return 15
    
  },
  message:"Too many requests, please try again later.",
  requestPropertyName:"rate_limit",
  statusCode:429,
  legacyHeaders:false,
  handler:(req,res,next)=>{    
    res.status(429).json({message:"Too many requests, please try again later."})
  },
  keyGenerator:(req)=>{

    const ip = ipKeyGenerator(req.headers['x-forwarded-for'] )
    console.log('the key generator is' , `${ip}-${req.path}`);
    
    return `${ip}-${req.path}`
  },
  store:new MongoStore({
    uri:process.env.DB_URL_LOCAL,
    collectionName:"rateLimit",
    expireTimeMs: 15 * 60 * 1000
  })
})