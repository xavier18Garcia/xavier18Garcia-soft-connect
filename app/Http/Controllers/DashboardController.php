<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(Request $request): View
    {
        $user = $request->user();

        $activity = $user->securityLogs()
            ->latest()
            ->take(10)
            ->get();

        return view('dashboard', compact('user', 'activity'));
    }
}
