import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { content, filename } = req.body;

    if (!content || !filename) {
      return res.status(400).json({ message: 'Missing content or filename' });
    }

    // Ensure the filename is safe
    const safeName = filename.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
    const filePath = path.join(process.cwd(), 'reports', safeName);

    // Ensure the reports directory exists
    await fs.mkdir(path.join(process.cwd(), 'reports'), { recursive: true });

    // Write the file
    await fs.writeFile(filePath, content, 'utf-8');

    res.status(200).json({ message: 'Report saved successfully' });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Error saving report' });
  }
} 