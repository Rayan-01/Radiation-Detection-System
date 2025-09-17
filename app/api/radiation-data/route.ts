import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/139PrOyrT4Nuwv_pLWpRdXvaS-J5BIRywC__49I8KCxE/export?format=csv';
    
    const response = await fetch(SHEET_CSV_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const csvData = await response.text();
    
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching radiation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch radiation data' },
      { status: 500 }
    );
  }
}