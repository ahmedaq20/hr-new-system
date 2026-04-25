<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'message' => 'HRMS API',
        'api' => [
            'version' => 'v1',
            'base_url' => url('/api/v1'),
        ],
        'health' => url('/up'),
    ], 200, ['Content-Type' => 'application/json'], JSON_UNESCAPED_SLASHES);
});

