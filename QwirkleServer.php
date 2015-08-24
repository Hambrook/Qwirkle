<?php

namespace Projects\Qwirkle;

use Wrench\Application\Application;
use Wrench\Application\NamedApplication;

/**
 * Example application for Wrench: echo server
 */
class QwirkleServer extends \Server\Apps\BaseProjectServer {
    var $tiles = [];

    public function __construct($app, $projectsApp, $project, $instance, $client, $data) {
        parent::__construct($app, $projectsApp, $project, $instance, $client, $data);
        $this->initTiles();
    }

    private function initTiles($tiles=[]) {
        if ($tiles) {
            $tiles = $this->validateTiles($tiles);
        } else {
            $tiles = [];
            for ($colour = 1; $colour <= 6; $colour++) {
                for ($icon = 1; $icon <= 6; $icon++) {
                    for ($i=0; $i<3; $i++) {
                        $id = count($tiles)+1;
                        $tiles[$id] = ["id" => $id, "colour" => $colour, "icon" => $icon];
                    }
                }
            }
        }
        $this->tiles = $tiles;
    }

    private function validateTiles($tiles=[]) {
        return true;
    }

    /**
     * Socket function
     */
    public function __onConnect($client) {
        if (!$client) {
            unset($client);
            return false;
        };

        $client->mode = \Nested::get($client->getQueryParams(), "mode", "player"); // player/viewer

        (new \SocketResponse($client, "Chat.Say"))
            ->name("System")
            ->id(0)
            ->text("This message comes from within QwirkleServer, sent via SocketResponse")
            ->send();
    }

    /**
     * Socket function
     */
    /*
    public function __onData($data, $client) {
        // code here
    }
    */

    /**
     * Socket function
     */
    /*
    public function __onDisconnect($client) {
        // code here
    }
    */

}