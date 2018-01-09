#!/bin/bash
ps aux|grep node |grep -v grep |awk '{print $2}'|kill -9

