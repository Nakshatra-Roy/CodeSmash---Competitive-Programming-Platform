import axios from 'axios';

export const getProblems = async () => {
  const res = await axios.get('/api/problems');
  return res.data;
};