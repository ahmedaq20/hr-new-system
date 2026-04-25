<?php

namespace Modules\ReferenceDataModule\Providers;

use Illuminate\Support\ServiceProvider;
use Nwidart\Modules\Traits\PathNamespace;

class ReferenceDataModuleServiceProvider extends ServiceProvider
{
    use PathNamespace;

    protected string $name = 'ReferenceDataModule';

    protected string $nameLower = 'reference-data-module';

    /**
     * Get the absolute filesystem path to the module root directory.
     */
    private function moduleBasePath(string $path = ''): string
    {
        $base = dirname(__DIR__, 2); // Modules/ReferenceDataModule

        return $path ? $base.DIRECTORY_SEPARATOR.$path : $base;
    }

    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        // Avoid `module_path()` here because it bootstraps the modules repository,
        // which may attempt to resolve deferred services (cache/translator) before
        // Laravel has finished registering deferred services.
        $this->loadMigrationsFrom($this->moduleBasePath('database/migrations'));
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        $this->registerConfig();

        $this->app->register(EventServiceProvider::class);
        $this->app->register(RouteServiceProvider::class);
    }

    /**
     * Register config.
     *
     * We merge module config into the app-level `reference_data` key because
     * the current seeder expects `config('reference_data')`.
     */
    protected function registerConfig(): void
    {
        // Avoid `module_path()` here for the same reason as above.
        $referenceDataPath = $this->moduleBasePath('config/reference_data.php');

        if (is_file($referenceDataPath)) {
            $this->publishes([$referenceDataPath => config_path('reference_data.php')], 'config');
            $this->mergeConfigFrom($referenceDataPath, 'reference_data');
        }
    }
}
