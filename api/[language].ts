import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.get(async (req, res) => {
  try {
    const language = req.query.language?.toString().toUpperCase() || 'E';

    res.status(200).json({ language });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router.build();
