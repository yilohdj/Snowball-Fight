import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Navigate two directories up from the current directory
    const filePath = path.join(process.cwd(), './snowballs.json');
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Players data file not found' },
        { status: 404 }
      );
    }
    
    // Read and parse the JSON file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const players = JSON.parse(fileData);
    
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error reading players data:', error);
    return NextResponse.json(
      { error: 'Failed to load players data' },
      { status: 500 }
    );
  }
}