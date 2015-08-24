<?php

namespace Projects\Qwirkle;

class Qwirkle extends \Server\Apps\BaseProjectClient {
    protected $app;
    protected $instanceId;

    public function __construct() {
        call_user_func_array([$this, "parent::__construct"], func_get_args());
    }

    public function render_index() {
        //$this->app["slim"]->render(__DIR__."/views/index.php");
        $foo = "hello there";
        $this->render("index");
    }

    private function render($file) {
        /*
        if ($return) {
            return file_get_contents(__DIR__."/views/".$file.".php");
        }
        */
        include(__DIR__."/views/".$file.".php");
        die;
    }

}