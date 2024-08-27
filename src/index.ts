import { RouterBuilder } from 'next-api-handler';

const router = new RouterBuilder();

router.get((req, res) => res.status(200).json({ message: 'Welcome to Crowdin Notifications API' }));

export default router.build();