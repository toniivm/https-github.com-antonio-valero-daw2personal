<?php
namespace SpotMap\Controllers;

use SpotMap\Auth;
use SpotMap\Roles;
use SpotMap\ApiResponse;
use SpotMap\DatabaseAdapter;
use SpotMap\SupabaseClient;
use SpotMap\Config;

class AdminController
{
    public function stats(): void
    {
        $user = Auth::requireUser();
        $role = Roles::getUserRole($user);
        if (!in_array($role, ['moderator','admin'])) ApiResponse::unauthorized('Moderator only');
        if (!DatabaseAdapter::useSupabase()) {
            ApiResponse::error('Stats require Supabase backend', 400);
        }
        $client = DatabaseAdapter::getClient(); // SupabaseClient
        $data = [
            'spots_total' => $client->countSpots(),
            'favorites_total' => $client->countTable('favorites'),
            'comments_total' => $client->countTable('comments'),
            'ratings_total' => $client->countTable('ratings'),
            'reports_pending' => $client->countReportsByStatus('pending'),
            'average_rating_global' => $client->averageRatingAll(),
            'timestamp' => time(),
            'env' => Config::get('ENV')
        ];
        ApiResponse::success($data);
    }
}
