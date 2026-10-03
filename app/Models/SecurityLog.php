<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityLog extends Model
{
    /** @use HasFactory<\Database\Factories\SecurityLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'ip_address',
        'user_agent',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Registra un evento de seguridad para un usuario.
     */
    public static function record(int $userId, string $action, ?string $ip, ?string $userAgent): self
    {
        return static::create([
            'user_id' => $userId,
            'action' => $action,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
        ]);
    }
}
