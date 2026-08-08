<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            ['client_name' => 'Acme Corporation', 'project_name' => 'Corporate Website Redesign', 'description' => "Redesign and modernize the company's corporate website.", 'status' => 'in_progress', 'priority' => 'high', 'start_date' => '2026-06-01', 'due_date' => '2026-07-15'],
            ['client_name' => 'GreenLeaf Cafe', 'project_name' => 'Online Ordering System', 'description' => 'Develop an online ordering platform for customers.', 'status' => 'planning', 'priority' => 'medium', 'start_date' => '2026-06-10', 'due_date' => '2026-08-01'],
            ['client_name' => 'Bright Realty', 'project_name' => 'Property Listing Portal', 'description' => 'Build a portal for managing property listings.', 'status' => 'on_hold', 'priority' => 'medium', 'start_date' => '2026-05-15', 'due_date' => '2026-07-30'],
            ['client_name' => 'Nova Fitness', 'project_name' => 'Mobile App MVP', 'description' => 'Develop the first version of the fitness tracking app.', 'status' => 'in_progress', 'priority' => 'high', 'start_date' => '2026-06-05', 'due_date' => '2026-08-20'],
            ['client_name' => 'Blue Ocean Travel', 'project_name' => 'Booking Platform Enhancement', 'description' => 'Improve search and booking functionalities.', 'status' => 'completed', 'priority' => 'medium', 'start_date' => '2026-04-01', 'due_date' => '2026-05-30'],
            ['client_name' => 'TechVision Solutions', 'project_name' => 'CRM Dashboard', 'description' => 'Develop an internal CRM dashboard.', 'status' => 'planning', 'priority' => 'high', 'start_date' => '2026-06-15', 'due_date' => '2026-08-15'],
            ['client_name' => 'Urban Living', 'project_name' => 'Property Management System', 'description' => 'Create a platform for managing rental properties.', 'status' => 'in_progress', 'priority' => 'medium', 'start_date' => '2026-05-20', 'due_date' => '2026-08-10'],
            ['client_name' => 'Elite Events', 'project_name' => 'Event Registration Portal', 'description' => 'Develop a registration and ticketing portal.', 'status' => 'planning', 'priority' => 'low', 'start_date' => '2026-06-20', 'due_date' => '2026-09-01'],
            ['client_name' => 'HealthFirst Clinic', 'project_name' => 'Patient Appointment System', 'description' => 'Build an appointment scheduling application.', 'status' => 'completed', 'priority' => 'high', 'start_date' => '2026-03-01', 'due_date' => '2026-05-01'],
            ['client_name' => 'MarketPro', 'project_name' => 'Marketing Campaign Dashboard', 'description' => 'Track and manage digital marketing campaigns.', 'status' => 'in_progress', 'priority' => 'medium', 'start_date' => '2026-06-01', 'due_date' => '2026-07-31'],
            ['client_name' => 'Sunrise Education', 'project_name' => 'Learning Management Portal', 'description' => 'Develop a portal for students and instructors.', 'status' => 'planning', 'priority' => 'high', 'start_date' => '2026-07-01', 'due_date' => '2026-09-30'],
            ['client_name' => 'FreshFarm', 'project_name' => 'Inventory Management System', 'description' => 'Track inventory across multiple locations.', 'status' => 'on_hold', 'priority' => 'low', 'start_date' => '2026-05-01', 'due_date' => '2026-08-01'],
        ];

        foreach ($projects as $project) {
            Project::create($project);
        }
    }
}
