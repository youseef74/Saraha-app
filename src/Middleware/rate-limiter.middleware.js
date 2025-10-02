import 'dotenv/config'; 
import mongoose from 'mongoose';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';
import { getCountryCode } from '../Utils/countries.utils.js';

await mongoose.connect(process.env.DB_URL_LOCAL);

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: async function (req) {
    const ip = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
    const { country_code } = await getCountryCode(ip);
    if (country_code === 'US') return 20;
    if (country_code === 'IN') return 10;
    return 15;
  },
  message: "Too many requests, please try again later.",
  requestPropertyName: "rate_limit",
  statusCode: 429,
  legacyHeaders: false,
  handler: (req, res, next) => {
    res.status(429).json({ message: "Too many requests, please try again later." });
  },
  keyGenerator: (req) => {
    const rawIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
    const ip = ipKeyGenerator(rawIp);
    return `${ip}-${req.path}`;
  },
  store: new MongoStore({
    uri: process.env.DB_URL_LOCAL,
    collectionName: 'rateLimit',
    expireTimeMs: 15 * 60 * 1000
  })
});
