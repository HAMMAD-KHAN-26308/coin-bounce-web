import axios from "axios";
import { parseError } from "./internal";
// const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const NEWS_API_ENDPOINT = `https://newsapi.org/v2/everything?q=business AND blockchain&sortBy=publishedAt&language=en&apiKey=c8788c3d57df40199db8979422b0fe4b`;
const CRYPTO_API_ENDPOINT = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`;

export const getNews = async () => {
  let response;

  try {
    response = await axios.get(NEWS_API_ENDPOINT);
    response = response.data.articles.slice(0, 15);
  } catch (error) {
    return parseError(error);
  }

  return response;
};

export const getCrypto = async () => {
  let response;

  try {
    response = await axios.get(CRYPTO_API_ENDPOINT, {
      headers: {
         "x-cg-demo-api-key": "CG-VaT2o9fdVRCDKeSCH3MjgZpy",
      }
    });
    response = response.data;
  } catch (error) {
    return parseError(error);
  }

  return response;
};
