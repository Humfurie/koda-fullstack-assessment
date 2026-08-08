<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\ProjectStatusEnum;
use App\Enums\ProjectPriorityEnum;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;

    protected $fillable = [
        'client_name',
        'project_name',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
    ];

    protected $casts = [
        'status' => ProjectStatusEnum::class,
        'priority' => ProjectPriorityEnum::class,
        'start_date' => 'date',
        'due_date' => 'date',
    ];


}
