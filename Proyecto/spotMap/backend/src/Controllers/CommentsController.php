<?php
namespace SpotMap\Controllers;

use SpotMap\Auth;
use SpotMap\ApiResponse;
use SpotMap\DatabaseAdapter;

class CommentsController
{
    public function list(int $spotId): void
    {
        if ($spotId <= 0) ApiResponse::error('Invalid spot', 400);
        $comments = DatabaseAdapter::commentsOf($spotId);
        ApiResponse::success(['comments' => $comments, 'count' => count($comments)]);
    }
    public function add(int $spotId): void
    {
        $user = Auth::requireUser();
        if ($spotId <= 0) ApiResponse::error('Invalid spot', 400);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $body = trim($input['body'] ?? '');
        if ($body === '') ApiResponse::error('Empty body', 400);
        $res = DatabaseAdapter::addComment($user['id'], $spotId, $body);
        if (isset($res['error'])) ApiResponse::error($res['error'], 400);
        ApiResponse::success($res, 'Comment added');
    }
    public function delete(int $commentId): void
    {
        $user = Auth::requireUser();
        if ($commentId <= 0) ApiResponse::error('Invalid comment', 400);
        $res = DatabaseAdapter::deleteComment($commentId);
        if (isset($res['error'])) ApiResponse::error($res['error'], 400);
        ApiResponse::success($res, 'Comment deleted');
    }
}
