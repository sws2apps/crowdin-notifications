import express from 'express';

const app = express();

app.get('/', async (req, res) => {
  res.status(200).json({ message: 'Welcome to Crowdin Notifications API' });
});

export default app;
