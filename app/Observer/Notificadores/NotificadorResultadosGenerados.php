<?php

namespace App\Observer\Notificadores;

use App\Observer\NotificadorBase;

/**
 * Notificador Concreto: Resultados Generados
 * 
 * RF 10: El Sistema deberá permitir visualizar los resultados de la evaluación.
 * Permite actualizar dashboards cuando se generen nuevos resultados.
 * 
 * Cada vez que suceda algo importante dentro de esta notificadora,
 * deberá notificar a todos sus suscriptores.
 */
class NotificadorResultadosGenerados extends NotificadorBase
{
    /**
     * ID de la evaluación
     *
     * @var int
     */
    private int $evaluacionId;

    /**
     * ID del usuario
     *
     * @var int
     */
    private int $userId;

    /**
     * Resultados generados por N8N
     *
     * @var array
     */
    private array $resultados;

    /**
     * Ruta del PDF generado (si existe)
     *
     * @var string|null
     */
    private ?string $pdfPath;

    /**
     * Puntuación obtenida
     *
     * @var float|null
     */
    private ?float $score;

    /**
     * Registra los resultados generados y notifica a los suscriptores
     *
     * @param int $evaluacionId ID de la evaluación
     * @param int $userId ID del usuario
     * @param array $resultados Resultados completos de N8N
     * @param string|null $pdfPath Ruta del PDF generado
     * @param float|null $score Puntuación obtenida
     * @return void
     */
    public function generarResultados(int $evaluacionId, int $userId, array $resultados, ?string $pdfPath = null, ?float $score = null): void
    {
        $this->evaluacionId = $evaluacionId;
        $this->userId = $userId;
        $this->resultados = $resultados;
        $this->pdfPath = $pdfPath;
        $this->score = $score;

        // Notificar a todos los suscriptores
        $this->notificar([
            'evaluacion_id' => $this->evaluacionId,
            'user_id' => $this->userId,
            'resultados' => $this->resultados,
            'pdf_path' => $this->pdfPath,
            'score' => $this->score
        ]);
    }

    /**
     * Obtiene el ID de la evaluación
     *
     * @return int
     */
    public function obtenerEvaluacionId(): int
    {
        return $this->evaluacionId;
    }

    /**
     * Obtiene el ID del usuario
     *
     * @return int
     */
    public function obtenerUserId(): int
    {
        return $this->userId;
    }

    /**
     * Obtiene los resultados
     *
     * @return array
     */
    public function obtenerResultados(): array
    {
        return $this->resultados;
    }

    /**
     * Obtiene la ruta del PDF
     *
     * @return string|null
     */
    public function obtenerPdfPath(): ?string
    {
        return $this->pdfPath;
    }

    /**
     * Obtiene la puntuación
     *
     * @return float|null
     */
    public function obtenerScore(): ?float
    {
        return $this->score;
    }
}

