<?php

namespace App\Enums;

enum ProjectStatusEnum: string
{
    case Planning = 'planning';
    case InProgress = 'in_progress';
    case OnHold = 'on_hold';
    case Completed = 'completed';

}
