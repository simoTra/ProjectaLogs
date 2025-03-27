#!/bin/bash

tmux \
    set -g mouse on \; \
    set -g remain-on-exit on \; \
    bind-key r respawn-pane \; \
    new-session -s dev 'npm run start:dev' \; select-pane -T backend \; \
    split-window -h 'cd dashboard && npm start' \; select-pane -T frontend \; \
    split-window -h \; select-pane -T shell \; \
    attach
