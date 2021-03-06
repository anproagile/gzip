<?php

namespace TBela\CSS\Value;

/**
 * parse font
 * @package TBela\CSS\Value
 */
trait UnitTrait
{

    /**
     * @inheritDoc
     */

    public function render(array $options = [])
    {

        if (isset($this->data->unit)) {

            if ($this->data->value == '0') {

                return '0';
            }

            if (!empty($options['compress'])) {

                return Number::compress($this->data->value) . $this->data->unit;
            }

            return $this->data->value . $this->data->unit;
        }

        return $this->data->value;
    }
}
