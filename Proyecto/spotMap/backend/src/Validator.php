<?php
namespace SpotMap;

/**
 * Clase para validación de datos
 * Fácil de portar a Laravel (similar a Laravel Validation)
 */
class Validator
{
    private $errors = [];

    /**
     * Valida que un campo sea requerido
     */
    public function required($value, $field)
    {
        if (empty($value)) {
            $this->errors[$field][] = "$field is required";
        }
        return $this;
    }

    /**
     * Valida que sea string
     */
    public function string($value, $field, $min = null, $max = null)
    {
        if (!is_string($value)) {
            $this->errors[$field][] = "$field must be a string";
            return $this;
        }

        if ($min && strlen($value) < $min) {
            $this->errors[$field][] = "$field must be at least $min characters";
        }

        if ($max && strlen($value) > $max) {
            $this->errors[$field][] = "$field must not exceed $max characters";
        }

        return $this;
    }

    /**
     * Valida que sea número
     */
    public function numeric($value, $field)
    {
        if (!is_numeric($value)) {
            $this->errors[$field][] = "$field must be numeric";
        }
        return $this;
    }

    /**
     * Valida coordenadas GPS
     */
    public function latitude($value, $field)
    {
        $lat = (float)$value;
        if ($lat < -90 || $lat > 90) {
            $this->errors[$field][] = "$field must be between -90 and 90";
        }
        return $this;
    }

    public function longitude($value, $field)
    {
        $lng = (float)$value;
        if ($lng < -180 || $lng > 180) {
            $this->errors[$field][] = "$field must be between -180 and 180";
        }
        return $this;
    }

    /**
     * Valida tipo de archivo
     */
    public function mimeType($file, $field, $allowed = [])
    {
        if (!isset($file['type'])) {
            $this->errors[$field][] = "$field is required";
            return $this;
        }

        if (!in_array($file['type'], $allowed)) {
            $this->errors[$field][] = "$field has invalid format";
        }

        return $this;
    }

    /**
     * Valida tamaño de archivo
     */
    public function fileSize($file, $field, $maxBytes = null)
    {
        if (!isset($file['size'])) {
            return $this;
        }

        if ($maxBytes && $file['size'] > $maxBytes) {
            $mb = $maxBytes / (1024 * 1024);
            $this->errors[$field][] = "$field must not exceed {$mb}MB";
        }

        return $this;
    }

    /**
     * ¿Hay errores?
     */
    public function fails()
    {
        return !empty($this->errors);
    }

    /**
     * Obtener todos los errores
     */
    public function errors()
    {
        return $this->errors;
    }

    /**
     * Alias para errors() (compatible con tests)
     */
    public function getErrors()
    {
        return $this->errors;
    }
}
