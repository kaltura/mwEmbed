<?php 

// get the target m3u8 
header( 'Content-Type: audio/x-mpegurl');
echo file_get_contents('http://www.nasa.gov/multimedia/nasatv/NTV-Public-IPS.m3u8');