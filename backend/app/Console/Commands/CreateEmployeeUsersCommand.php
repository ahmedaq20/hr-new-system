<?php

namespace App\Console\Commands;

use App\Jobs\CreateEmployeeUsersJob;
use Illuminate\Console\Command;

class CreateEmployeeUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'employees:create-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create user accounts for all employees who do not have accounts.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        CreateEmployeeUsersJob::dispatch();
        $this->info('Employee user creation job dispatched successfully.');
    }
}
