import axios from 'axios';
import 'dotenv/config';


export async function getCountryCode(ip) {

    const response = await axios.get(`https://ipapi.co/${ip}/json/`)
    return response.data
    
    console.log(response);
    
  
  }