async function updateLocation(db, id, lat, long){
    const query = `
        INSERT INTO userlocations (userid, longitude, latitude)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET longitude = $2, latitude = $3 last_updated = CURRENT_TIMESTAMP
        RETURNING *;
      `;
    
    try {
        const result = await db.query(query, [id, long, lat]);
        return result.rows[0];
    } catch (error) {
        // console.error('Error updating location:', error);
        return error;
        // res.status(500).send('Internal Server Error');
    }
}



  //create table UserLocations (userid references Users.userid, longitude double precision, latitude double precision, last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP);