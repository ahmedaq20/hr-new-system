<?php

return [
    App\Providers\AppServiceProvider::class,
    // Add these lines:
    Modules\EmployeeDegree\Providers\EmployeeDegreeServiceProvider::class,
    Modules\EmployeeDegree\Providers\RouteServiceProvider::class,
];
