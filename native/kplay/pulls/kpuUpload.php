<?php

header("Content-Type", "text/plain");

require_once(realpath(__DIR__ . "/kpuConfig.php"));
// kpuConfig.php must be present and must include:
// $kpuUploadDir, $kpuAuthToken, $kpuMaxSize, $kpuValidPlatforms

// Assuming $kpuUploadDir/android and $kpuUploadDir/ios are already created.


// mandatory fields: upfile (file), pull (number), platform (android/ios), token (token)


function error($code, $msg = 'Server error') {
    http_response_code($code);
    throw new RuntimeException($msg);    
}

function error400($msg) {
    error(400, $msg);
}

function error500() {
    error(500, "Server Error");
}


try {
    
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        error(405, "Only POST");
    }
    
    // Token
    if (isset($_POST["token"])) {
        $token = $_POST["token"];
        if ($token != $kpuAuthToken) {
            error400("Invalid auth token");
        }
    } else {
        error400("Missing parameter token");
    }
    
    // Pull
    if (isset($_POST["pull"])) {
        $pull = $_POST["pull"];
        if (! is_numeric($pull)) {
            error400("Invalid pull " . $pull . ", must be a number");
        }
    } else {
        error400("Missing parameter pull");
    }
    
    // Platform
    if (isset($_POST["platform"])) {
        $platform = $_POST["platform"];
        if (! in_array($platform, $kpuValidPlatforms)) {
            error400("Invalid platform " . $platform . ", must be " . implode(" or ", $kpuValidPlatforms));
        }
    } else {
        error400("Missing parameter platform");
    }

    // File
    // Validation code adapted from http://php.net/manual/en/features.file-upload.php#114004

    if (isset($_FILES["upfile"])) {
        $upfile = $_FILES['upfile'];
    } else {
        error400("Missing parameter upfile");
    }
   
    // Undefined | Multiple Files | $_FILES Corruption Attack
    // If this request falls under any of them, treat it invalid.
    if (!isset($upfile['error']) || is_array($upfile['error'])) {
        error400('Invalid parameters.');
    }

    // Check $_FILES['upfile']['error'] value.
    switch ($upfile['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            error400('No file sent.');
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            error400('Exceeded filesize limit (c).');
        default:
            error400('Unknown errors ' . $upfile["error"]);
    }

    // Check filesize.
    if ($upfile['size'] > $kpuMaxSize) {
        error400('Exceeded filesize limit.');
    }
    
    if (!is_uploaded_file($upfile["tmp_name"])) {
        error400("Not an uploaded file");
    }
    
    // Done validations.

    $upfile_name = basename($upfile["name"]);

    $uploaddir = $kpuUploadDir . "/" . $platform . "/" . $pull;
    if (!is_dir($uploaddir)) {
        if (!mkdir($uploaddir)) {
            error500();
        }
    }
    
    $uploadfile = $uploaddir . "/" . $upfile_name;
    
    if (!move_uploaded_file($upfile["tmp_name"], $uploadfile)) {
        error500();
    }
    
    echo "OK\n";
    

} catch (RuntimeException $e) {
    echo $e->getMessage() . "\n";
}

?>
