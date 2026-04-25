<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reference_data', function (Blueprint $table) {
            if (! Schema::hasColumn('reference_data', 'slug')) {
                $table->string('slug')->nullable()->after('value');
                $table->unique('slug');
            }
        });

        $referenceData = config('reference_data', []);

        foreach ($referenceData as $name => $values) {
            foreach ($values as $value) {
                if (is_array($value) && ! empty($value['slug']) && ! empty($value['value'])) {
                    DB::table('reference_data')
                        ->where('name', $name)
                        ->where('value', $value['value'])
                        ->update(['slug' => $value['slug']]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reference_data', function (Blueprint $table) {
            if (Schema::hasColumn('reference_data', 'slug')) {
                $table->dropUnique('reference_data_slug_unique');
                $table->dropColumn('slug');
            }
        });
    }
};
