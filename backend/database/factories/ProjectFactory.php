<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-3 months', '+1 month');

        return [
            'client_name' => $this->faker->company(),
            'project_name' => $this->faker->catchPhrase(),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['planning', 'in_progress', 'on_hold', 'completed']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
            'start_date' => $startDate,
            'due_date' => $this->faker->dateTimeBetween($startDate, '+4 months'),
        ];
    }
}
