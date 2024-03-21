# @fast-check/LTL

Add the ability to test models with [fast-check](https://fast-check.dev/) using [linear temporal logic](https://en.wikipedia.org/wiki/Linear_temporal_logic). Based on the work of [Oskar Wickstrom](https://quickstrom.io/) and [Liam O'Connor](https://arxiv.org/pdf/2203.11532.pdf).

## Install

```sh
npm i --save-dev \@fast-check/LTL
```

## Examples

### Documentation

### Methods
* [`temporalModelRun`](#temporalModelRun) - Runs a syncronous temporal model using fast-check and linear temporal logic.
* [`temporalAsyncModelRun`](#temporalAsyncModelRun) - Runs an asynchronous temporal model using fast-check and linear temporal logic.
* [`ltlEvaluate`](#ltlEvaluate) - Evaluates a linear temporal logic expression on a given array of states.
* [`ltlEvaluateGenerator`](#ltlEvaluateGenerator) - Evaluates a linear temporal logic expression on a given state and provide generator to continue evaluating the temporal logic as new states are generate

* [`Predicate`](#Predicate) - Creates predicate function (returns boolean) on state 
* [`Unchanged`](#Unchanged) - Create predicate function to compare if two states are equal
* [`Comparison`](#Comparison) - Create predicate functions to compare if two states maintain some relationship
* [`And`](#And) - Create expression with the logical AND operation.
* [`Or`](#Or) - Create expression with the logical OR operation.
* [`Not`](#Not) - Create expression with the logical NOT operation.
* [`Implies`](#Implies) - Create expression with the logical IMPLIES operation.
* [`True`](#True) - Create expression with the logical TRUE value.
* [`False`](#False) - Create expression with the logical FALSE value.
* [`Next`](#Next) - Create expression with the next state operator.
* [`Eventually`](#Eventually) - Create expression with the eventually operator.
* [`Until`](#Until) - Create expression with the until operator.
* [`Release`](#Release) - Create expression with the release operator.
* [`Henceforth`](#Henceforth) - Create expression with the henceforth operator.
