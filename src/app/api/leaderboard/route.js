import { NextResponse } from 'next/server';

const BUCKET_URL = 'https://kvdb.io/toeic_mock_leaderboard_iig_12_sec/records';

// Fallback database in memory (for local dev if KVDB.io is down or blocked)
let memoryDb = [];

async function getLeaderboard() {
  try {
    const res = await fetch(BUCKET_URL, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 } // Disable Next.js caching
    });
    
    if (res.status === 404) {
      return [];
    }
    
    if (!res.ok) {
      throw new Error(`Failed to fetch from KVDB: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (err) {
    console.error('Error reading from KVDB, using fallback:', err);
    return memoryDb;
  }
}

async function saveLeaderboard(data) {
  try {
    const res = await fetch(BUCKET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      throw new Error(`Failed to save to KVDB: ${res.statusText}`);
    }
    
    // Also save to memory as fallback
    memoryDb = data;
    return true;
  } catch (err) {
    console.error('Error saving to KVDB, using fallback:', err);
    memoryDb = data;
    return false;
  }
}

export async function GET() {
  const records = await getLeaderboard();
  // Ensure it's sorted
  const sorted = [...records].sort((a, b) => b.score - a.score || b.timeSpent - a.timeSpent);
  return NextResponse.json(sorted);
}

export async function POST(request) {
  try {
    const { name, score, listeningCorrect, readingCorrect, timeSpent, date } = await request.json();
    
    if (!name || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    const records = await getLeaderboard();
    
    // Add new record
    const newRecord = {
      name: name.trim().substring(0, 30),
      score,
      listeningCorrect,
      readingCorrect,
      timeSpent, // in seconds
      date: date || new Date().toISOString()
    };
    
    records.push(newRecord);
    
    // Sort by score (descending), then by timeSpent (ascending)
    const sorted = records
      .sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent)
      .slice(0, 100); // Keep top 100
      
    await saveLeaderboard(sorted);
    
    return NextResponse.json({ success: true, leaderboard: sorted });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
