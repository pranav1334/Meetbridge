#!/usr/bin/env python3
"""Migration script to add auth_provider column to users table"""

import psycopg2
from psycopg2 import sql

try:
    conn = psycopg2.connect('postgresql://postgres:pranav123@localhost:5432/meetbridge_db')
    cur = conn.cursor()
    
    # Add the auth_provider column if it doesn't exist
    cur.execute('''
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS auth_provider VARCHAR DEFAULT 'local';
    ''')
    conn.commit()
    print('✓ auth_provider column added successfully')
    
except Exception as e:
    print(f'Error: {e}')
finally:
    cur.close()
    conn.close()
