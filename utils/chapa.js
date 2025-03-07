import axios from 'axios';

const CHAPA_BASE_URL = 'https://api.chapa.co/v1/transaction/initialize';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

const initializePayment = async (paymentData) => {
    try {
        const response = await axios.post(CHAPA_BASE_URL, paymentData, {
            headers: {
                Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : error.message);
    }
};

export default initializePayment;