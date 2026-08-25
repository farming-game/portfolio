---
layout: home
title: Survival Game
---

<div class="project-meta">

  <div class="meta-item">
    <span>Begin</span>
    <strong class="meta-value">08/2024</strong>
  </div>

<div class="meta-item">
  <span>OWN C++ CODE</span>
  <strong class="meta-value meta-value-wrap">
    <span class="meta-approx">~</span>
    <span class="count-up" data-target="7500">0</span>
  </strong>
  <strong class="meta-suffix">Lines</strong>
</div>

  <div class="meta-item">
    <span>Language</span>
    <strong class="meta-value">C++</strong>
  </div>

  <div class="meta-item">
    <span>Engine</span>
    <strong class="meta-value">Unreal Engine 5</strong>
  </div>

</div>

> **Note on the source code.**  
> Since this project is under active development and is intended for eventual release, the full source code is not public. The snippets shown here are taken from the production project and have been narrowed down to the architectural decisions relevant to this portfolio.

## Overview

Since August 2024, I've been independently developing a survival game with Unreal Engine 5 and C++. What started as a small learning project grew into an extensive software system with roughly 7,500 lines of my own C++ code.

As the feature set grew, so did the demands on the architecture. Existing systems were therefore refactored multiple times to separate responsibilities more clearly, reduce direct dependencies, and make components reusable.

A central part of the project is the continuous evolution of the architecture: decisions aren't judged only by their current functionality, but also by how well they can be extended and maintained as complexity grows.

## Architecture

### From Class Explosion to Data-Driven Design

In the initial commit, every resource in the game was its own Actor subclass. `ACoal`, `AIron`, `AGold`, `ADiamond`, `AStone`, and `ATree` all inherited from `ACollect` and differed only by hardcoded constructor parameters:

<div class="highlight">
<pre><code><span class="c1">// Tree.cpp</span>
<span class="cp">#include</span> <span class="s">"Tree.h"</span>

<span class="cpp-class">ATree</span><span class="p">::</span><span class="cpp-function">ATree</span><span class="p">()</span>
    <span class="p">:</span> <span class="cpp-class">ACollect</span><span class="p">(</span><span class="cpp-class">ECollectables</span><span class="p">::</span><span class="cpp-class">Tree</span><span class="p">,</span> <span class="cpp-class">EItemID</span><span class="p">::</span><span class="n">wood</span><span class="p">,</span> <span class="mi">32</span><span class="p">)</span> <span class="p">{</span> <span class="p">}</span>

<span class="p">...</span></code></pre>
</div>

Six practically identical classes, whose only difference was three hardcoded values in the constructor — every new resource meant a new C++ class plus a Blueprint.

By the second commit, these subclasses were already gone. Instead, there's a single, parameterized `ACollect` class, described via an enum type (`ECollectables`) and an `FCollectable` struct:

<div class="highlight">
<pre><code><span class="c1">// Collect.h</span>
<span class="cpp-macro">USTRUCT</span><span class="p">(</span><span class="n">BlueprintType</span><span class="p">)</span>
<span class="k">struct</span> <span class="cpp-class">FCollectable</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

    <span class="cpp-macro">UPROPERTY</span><span class="p">(</span><span class="n">EditAnywhere</span><span class="p">,</span> <span class="n">BlueprintReadWrite</span><span class="p">)</span>
    <span class="cpp-class">ECollectables</span> <span class="n">CollectableObject</span> <span class="o">=</span> <span class="cpp-class">ECollectables</span><span class="p">::</span><span class="n">Empty</span><span class="p">;</span>

    <span class="cpp-macro">UPROPERTY</span><span class="p">(</span><span class="n">EditAnywhere</span><span class="p">,</span> <span class="n">BlueprintReadWrite</span><span class="p">)</span>
    <span class="cpp-class">EItemID</span> <span class="n">DroppedItem</span> <span class="o">=</span> <span class="cpp-class">EItemID</span><span class="p">::</span><span class="n">empty</span><span class="p">;</span>

    <span class="cpp-macro">UPROPERTY</span><span class="p">(</span><span class="n">EditAnywhere</span><span class="p">,</span> <span class="n">BlueprintReadWrite</span><span class="p">)</span>
    <span class="k">int</span> <span class="n">DropQuantity</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span>
<span class="p">};</span>

<span class="cpp-macro">UCLASS</span><span class="p">()</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">ACollect</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">AClickableActor</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="cpp-function">ACollect</span><span class="p">();</span>
    <span class="cpp-class">FCollectable</span><span class="o">&amp;</span> <span class="cpp-function">GetCollectable</span><span class="p">();</span>

<span class="k">private</span><span class="p">:</span>
    <span class="cpp-macro">UPROPERTY</span><span class="p">()</span>
    <span class="cpp-class">FCollectable</span> <span class="n">Collectable</span><span class="p">;</span>
<span class="p">};</span></code></pre>
</div>

Since then, new resource types no longer require a dedicated C++ class — they're configured through the existing structure and data instead.

![Description of the image](assets/images/Collectable.PNG)

### Separating Responsibilities Through Components

Reusable responsibilities were extracted into their own component classes that can be attached to any object in the game. Responsibilities were deliberately split across separate components so that individual functions can be reused independently of one another.

<div class="highlight">
<pre><code><span class="c1">// CollectableComponent.h</span>
<span class="cpp-macro">UCLASS</span><span class="p">(</span><span class="n">ClassGroup</span><span class="o">=</span><span class="p">(</span><span class="n">Custom</span><span class="p">),</span> <span class="n">meta</span><span class="o">=</span><span class="p">(</span><span class="n">BlueprintSpawnableComponent</span><span class="p">))</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UCollectableComponent</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">UActorComponent</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="cpp-class">FCollectable</span><span class="o">&amp;</span> <span class="cpp-function">GetCollectable</span><span class="p">();</span>

<span class="k">private</span><span class="p">:</span>
    <span class="cpp-macro">UPROPERTY</span><span class="p">(</span><span class="n">EditAnywhere</span><span class="p">,</span> <span class="n">BlueprintReadWrite</span><span class="p">,</span> <span class="n">Category</span> <span class="o">=</span> <span class="s">"Collectable"</span><span class="p">,</span> <span class="n">Meta</span> <span class="o">=</span> <span class="p">(</span><span class="n">AllowPrivateAccess</span> <span class="o">=</span> <span class="s">"true"</span><span class="p">))</span>
    <span class="cpp-class">ECollectables</span> <span class="n">CollectableType</span><span class="p">;</span>

    <span class="cpp-class">FCollectable</span> <span class="n">Collectable</span><span class="p">;</span>
<span class="p">};</span>

<span class="c1">// ProgressComponent.h</span>
<span class="k">class</span> <span class="cpp-class">UProgressBarWidget</span><span class="p">;</span>

<span class="cpp-macro">UCLASS</span><span class="p">(</span><span class="n">ClassGroup</span><span class="o">=</span><span class="p">(</span><span class="n">Custom</span><span class="p">),</span> <span class="n">meta</span><span class="o">=</span><span class="p">(</span><span class="n">BlueprintSpawnableComponent</span><span class="p">))</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UProgressComponent</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">UWidgetComponent</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="k">void</span> <span class="cpp-function">ShowProgress</span><span class="p">();</span>
    <span class="k">void</span> <span class="cpp-function">HideProgress</span><span class="p">();</span>
    <span class="k">void</span> <span class="cpp-function">SetProgress</span><span class="p">(</span><span class="k">const float</span> <span class="n">Progress</span><span class="p">)</span> <span class="k">const</span><span class="p">;</span>

<span class="k">private</span><span class="p">:</span>
    <span class="cpp-macro">UPROPERTY</span><span class="p">()</span>
    <span class="cpp-class">TObjectPtr</span><span class="p">&lt;</span><span class="cpp-class">UProgressBarWidget</span><span class="p">&gt;</span> <span class="n">ProgressWidget</span><span class="p">;</span>
<span class="p">};</span></code></pre>
</div>

`UCollectableComponent` encapsulates exclusively the collectable data of an object, while `UProgressComponent` handles exclusively the progress display while harvesting. Both are independently reusable, so an object that only needs one of the two functions doesn't have to carry the other along.

### Resolving a "God Manager" Into Focused Subsystems

To let several systems communicate with each other, a `UItemCollectionManager` was introduced. Over time it grew into a god class, holding direct dependencies on the Character, Controller, Equipment, Inventory, and Collect classes:

<div class="highlight">
<pre><code><span class="cpp-macro">UCLASS</span><span class="p">()</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UItemCollectionManager</span> <span class="p">:</span> <span class="k">public</span>
<span class="cpp-class">UGameInstanceSubsystem</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="k">void</span> <span class="cpp-function">NotifyCollectResource</span><span class="p">(</span><span class="cpp-class">ACollect</span><span class="o">*</span> <span class="n">CollectedActor</span><span class="p">);</span>
    <span class="k">void</span> <span class="cpp-function">NotifyScrollInventory</span><span class="p">(</span><span class="cpp-class">FItem</span><span class="o">&amp;</span> <span class="n">CurrentSelectedItem</span><span class="p">);</span>
    <span class="k">void</span> <span class="cpp-function">ResetEquipment</span><span class="p">();</span>

    <span class="cpp-macro">UPROPERTY</span><span class="p">(</span><span class="n">EditAnywhere</span><span class="p">,</span> <span class="n">BlueprintReadWrite</span><span class="p">,</span> <span class="n">Category</span> <span class="o">=</span> <span class="s">"Equipment"</span><span class="p">)</span>
    <span class="cpp-class">TMap</span><span class="p">&lt;</span><span class="cpp-class">EEquipmentType</span><span class="p">,</span> <span class="cpp-class">TObjectPtr</span><span class="p">&lt;</span><span class="cpp-class">UEquipment</span><span class="p">&gt;&gt;</span> <span class="n">EquipmentMap</span><span class="p">;</span>

<span class="k">private</span><span class="p">:</span>
    <span class="cpp-class">TObjectPtr</span><span class="p">&lt;</span><span class="cpp-class">ACollect</span><span class="p">&gt;</span> <span class="n">CurrentCollectable</span> <span class="o">=</span> <span class="kc">nullptr</span><span class="p">;</span>
    <span class="cpp-class">TObjectPtr</span><span class="p">&lt;</span><span class="cpp-class">AInventory</span><span class="p">&gt;</span> <span class="n">Inventory</span> <span class="o">=</span> <span class="kc">nullptr</span><span class="p">;</span>
    <span class="cpp-class">TObjectPtr</span><span class="p">&lt;</span><span class="cpp-class">AFarmingGameCharacter</span><span class="p">&gt;</span> <span class="n">PlayerCharacter</span> <span class="o">=</span> <span class="kc">nullptr</span><span class="p">;</span>
    <span class="cpp-class">TObjectPtr</span><span class="p">&lt;</span><span class="cpp-class">AFarmingGamePlayerController</span><span class="p">&gt;</span> <span class="n">PlayerController</span> <span class="o">=</span> <span class="kc">nullptr</span><span class="p">;</span>
<span class="p">};</span></code></pre>
</div>

Through a refactor, `UItemCollectionManager` was split into a `UEquipmentManager` (pure equipment logic) and a `UPlayerInventoryManager` (pure inventory management). This cleanly separated responsibilities and reduced direct dependencies between the involved systems.

<div class="highlight">
<pre><code><span class="cpp-macro">UCLASS</span><span class="p">()</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UEquipmentManager</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">UGameInstanceSubsystem</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="k">virtual void</span> <span class="cpp-function">Initialize</span><span class="p">(</span><span class="cpp-class">FSubsystemCollectionBase</span><span class="o">&amp;</span> <span class="n">Collection</span><span class="p">)</span> <span class="k">override</span><span class="p">;</span>
    <span class="k">void</span> <span class="cpp-function">NotifyScrollInventory</span><span class="p">(</span><span class="cpp-class">FItem</span><span class="o">&amp;</span> <span class="n">CurrentSelectedItem</span><span class="p">);</span>
    <span class="cpp-class">UEquipment</span><span class="o">*</span> <span class="cpp-function">GetCurrentEquipment</span><span class="p">();</span>
    <span class="k">bool</span> <span class="cpp-function">HandleIfEquipToolCanCollectObject</span><span class="p">(</span><span class="cpp-class">ECollectables</span> <span class="n">Collectable</span><span class="p">);</span>
    <span class="k">void</span> <span class="cpp-function">HandleIdle</span><span class="p">();</span>
    <span class="k">void</span> <span class="cpp-function">HandleHold</span><span class="p">();</span>
    <span class="k">void</span> <span class="cpp-function">HandleUse</span><span class="p">();</span>

<span class="k">private</span><span class="p">:</span>
    <span class="cpp-macro">UPROPERTY</span><span class="p">()</span>
    <span class="cpp-class">TMap</span><span class="p">&lt;</span><span class="cpp-class">EEquipmentType</span><span class="p">,</span> <span class="cpp-class">TObjectPtr</span><span class="p">&lt;</span><span class="cpp-class">UEquipment</span><span class="p">&gt;&gt;</span> <span class="n">EquipmentMap</span><span class="p">;</span>
<span class="p">};</span></code></pre>
</div>

<br>

<div class="highlight">
<pre><code><span class="c1">// PlayerInventoryManager.h</span>
<span class="k">class</span> <span class="n">UInventory</span><span class="p">;</span>

<span class="cpp-macro">UCLASS</span><span class="p">()</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UPlayerInventoryManager</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">UGameInstanceSubsystem</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="k">void</span> <span class="cpp-function">RegisterInventory</span><span class="p">(</span><span class="cpp-class">EItemCollectionEventManagerTypes</span> <span class="n">EventManagerType</span><span class="p">,</span> <span class="cpp-class">UObject</span><span class="o">*</span> <span class="n">ObjectClassToSubscribe</span><span class="p">);</span>
    <span class="k">int</span> <span class="cpp-function">GiveItem</span><span class="p">(</span><span class="cpp-class">EItemID</span> <span class="n">ItemID</span><span class="p">,</span> <span class="k">int</span> <span class="n">Quantity</span><span class="p">);</span>
    <span class="cpp-class">UInventory</span><span class="o">*</span> <span class="cpp-function">GetInventory</span><span class="p">(</span><span class="cpp-class">EInventoryType</span> <span class="n">Type</span><span class="p">)</span> <span class="k">const</span><span class="p">;</span>

<span class="k">private</span><span class="p">:</span>
    <span class="cpp-macro">UPROPERTY</span><span class="p">()</span>
    <span class="cpp-class">TMap</span><span class="o">&lt;</span><span class="cpp-class">EInventoryType</span><span class="p">,</span> <span class="cpp-class">TObjectPtr</span><span class="o">&lt;</span><span class="cpp-class">UInventory</span><span class="o">&gt;&gt;</span> <span class="n">Inventories</span><span class="p">;</span>
<span class="p">};</span></code></pre>
</div>

Through event-based communication, I reduced direct dependencies between the involved subsystems. The inventory system no longer needs to know its consumers: it publishes changes via delegates that interested systems and widgets can react to independently. This reduces the direct coupling between the involved systems.

<div class="highlight">
<pre><code><span class="cpp-macro">DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam</span><span class="p">(</span><span class="cpp-class">FOnInventoryChanged</span><span class="p">,</span> <span class="k">const</span> <span class="cpp-class">TArray</span><span class="o">&lt;</span><span class="cpp-class">FItem</span><span class="o">&gt;&amp;</span><span class="p">,</span> <span class="n">Inventory</span><span class="p">);</span></code></pre>
</div>

As a result, `UEquipmentManager` and `UPlayerInventoryManager` don't know about each other. Both simply react to relevant events, triggered for example by the inventory or the hotbar. Changes to one system can happen without directly modifying the dependent systems.

## The Biggest Challenge

The inventory system grew into the most complex, interconnected part of the project. As the feature set grew, interaction logic, a hotbar, and several UI components were added on top of the core inventory management. In the original architecture, these responsibilities largely lived in a single class and were tightly coupled as a result.

To reduce the resulting complexity, the system was refactored in several steps.

### 1. Decoupling the UI Through Events

First, the direct dependency between the inventory and the UI was removed. The inventory publishes changes via events that the widgets react to.

As a result, the inventory no longer knows its UI consumers, and the presentation can evolve independently of the data layer.

<div class="highlight">
<pre><code><span class="n">MyInventory</span><span class="o">-&gt;</span><span class="n">OnInventoryChanged</span><span class="p">.</span><span class="cpp-function">AddDynamic</span><span class="p">(</span> <span class="k">this</span><span class="p">,</span> <span class="o">&amp;</span><span class="cpp-class">UInventoryWidget</span><span class="o">::</span><span class="cpp-function">PopulateInventory</span> <span class="p">);</span></code></pre>
</div>

### 2. A Separate Hotbar Through Specialization

The hotbar uses the shared inventory logic of `UInventory`, but needs additional rules for active slot selection and scroll behavior.

Rather than integrating these special cases into `UInventory`, `UHotbar` was introduced as a specialization of `UInventory`. Shared functionality stays centralized in the base class, while the hotbar only adds its specific behavior.

<div class="highlight">
<pre><code><span class="c1">// Hotbar.h</span>
<span class="cpp-macro">UCLASS</span><span class="p">(</span><span class="n">ClassGroup</span><span class="o">=</span><span class="p">(</span><span class="n">Custom</span><span class="p">),</span> <span class="n">meta</span><span class="o">=</span><span class="p">(</span><span class="n">BlueprintSpawnableComponent</span><span class="p">))</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UHotbar</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">UInventory</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="cpp-function">UHotbar</span><span class="p">();</span>

    <span class="k">virtual</span> <span class="k">void</span> <span class="cpp-function">Scroll</span><span class="p">(</span> <span class="k">float</span> <span class="n">AxisValue</span> <span class="p">)</span> <span class="k">override</span><span class="p">;</span>

    <span class="cpp-macro">UFUNCTION</span><span class="p">()</span>
    <span class="cpp-class">FItem</span><span class="p">&amp;</span> <span class="cpp-function">GetSelectedItem</span><span class="p">();</span>

    <span class="k">virtual</span> <span class="k">void</span> <span class="cpp-function">UpdateInventoryUI</span><span class="p">()</span> <span class="k">override</span><span class="p">;</span>
    <span class="k">virtual</span> <span class="k">bool</span> <span class="cpp-function">CanSelectItem</span><span class="p">(</span> <span class="k">int</span> <span class="n">Index</span><span class="p">,</span> <span class="cpp-class">EItemSelectOption</span> <span class="n">ItemSelectOption</span> <span class="p">)</span> <span class="k">override</span><span class="p">;</span>
<span class="p">};</span></code></pre>
</div>

### 3. Centralized Data Access via DataTableManager

As the number of systems grew, so did the number of required DataTables. Instead of referencing and loading tables individually across various classes, a central `UDataTableManager` was introduced.

The manager provides a unified interface for accessing different tables. DataTables are loaded on first access and then cached for the lifetime of the `GameInstance`. This means individual systems don't need to know where the tables are configured, nor manage their loading and cache state.

<div class="highlight">
<pre><code><span class="c1">// DataTableManager.h</span>
<span class="cpp-macro">UCLASS</span><span class="p">()</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UDataTableManager</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">UGameInstanceSubsystem</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="k">template</span><span class="o">&lt;</span><span class="k">typename</span> <span class="cpp-class">TRow</span><span class="p">,</span> <span class="k">typename</span> <span class="cpp-class">TEnum</span><span class="o">&gt;</span>
    <span class="k">const</span> <span class="cpp-class">TRow</span><span class="o">*</span> <span class="cpp-function">FindRow</span><span class="p">(</span><span class="cpp-class">EDataTable</span> <span class="n">TableType</span><span class="p">,</span> <span class="cpp-class">TEnum</span> <span class="n">EnumValue</span><span class="p">)</span> <span class="k">const</span><span class="p">;</span>

<span class="k">private</span><span class="p">:</span>
    <span class="k">mutable</span> <span class="cpp-class">TMap</span><span class="o">&lt;</span><span class="cpp-class">EDataTable</span><span class="p">,</span> <span class="cpp-class">TObjectPtr</span><span class="o">&lt;</span><span class="cpp-class">UDataTable</span><span class="o">&gt;&gt;</span> <span class="n">CachedDataTables</span><span class="p">;</span>
<span class="p">};</span></code></pre>
</div>

Thanks to the template-based interface, the same access pattern can be used for different row types:

<div class="highlight">
<pre><code><span class="k">const</span> <span class="cpp-class">FItem</span><span class="o">*</span> <span class="n">Item</span> <span class="o">=</span> <span class="cpp-class">DataTableManager</span><span class="o">-&gt;</span><span class="cpp-function">FindRow</span><span class="o">&lt;</span><span class="cpp-class">FItem</span><span class="o">&gt;</span><span class="p">(</span><span class="cpp-class">EDataTable</span><span class="o">::</span><span class="n">Items</span><span class="p">,</span> <span class="cpp-class">EItemID</span><span class="o">::</span><span class="n">wood</span><span class="p">);</span></code></pre>
</div>

This keeps the concrete DataTable access separate from the gameplay systems and routed through a single, unified API.
<br>
<br>
#### Example: Item Data

<div style="display: flex; gap: 20px; align-items: flex-start;">

    <!-- Left side: Code -->
    <div style="width: 50%;">
        <div class="highlight">
            <pre><code><span class="c1">// Data.h</span>
<span class="cpp-macro">USTRUCT</span><span class="p">(</span><span class="n">BlueprintType</span><span class="p">)</span>
<span class="k">struct</span> <span class="cpp-class">FItem</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">FTableRowBase</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

    <span class="cpp-class">EItemID</span> <span class="n">ItemID</span> <span class="o">=</span> <span class="cpp-class">EItemID</span><span class="o">::</span><span class="n">empty</span><span class="p">;</span>
    <span class="cpp-class">TSoftObjectPtr</span><span class="o">&lt;</span><span class="cpp-class">UTexture2D</span><span class="o">&gt;</span> <span class="n">Thumbnail</span><span class="p">;</span>
    <span class="cpp-class">TSoftObjectPtr</span><span class="o">&lt;</span><span class="cpp-class">UStaticMesh</span><span class="o">&gt;</span> <span class="n">Mesh</span><span class="p">;</span>
    <span class="k">bool</span> <span class="n">Stackable</span> <span class="o">=</span> <span class="k">false</span><span class="p">;</span>
    <span class="cpp-class">EItemType</span> <span class="n">ItemType</span> <span class="o">=</span> <span class="cpp-class">EItemType</span><span class="o">::</span><span class="n">IsMaterial</span><span class="p">;</span>
    <span class="k">int</span> <span class="n">Quantity</span> <span class="o">=</span> <span class="mi">0</span><span class="p">;</span>
    <span class="cpp-class">FItemEffect</span> <span class="n">Effect</span><span class="p">;</span>
<span class="p">};</span></code></pre>
        </div>
    </div>

    <!-- Right side: Image -->
    <div style="width: 50%;">
        <img src="assets/images/Brown_Cap.PNG" alt="Description" style="width: 100%; height: auto;">
    </div>

</div>

### 4. Extracting the Interaction Logic

Another problem area was the actual interaction with items: moving, stacking, splitting, and swapping.

This logic originally lived directly inside the inventory. As a result, interaction was tailored to a single inventory. Moving an item between the player's inventory and the hotbar, or between any two inventories, required additional special cases.

The interaction logic was therefore extracted into `UInventoryInteraction`. The class operates on whichever `UInventory` is affected, allowing it to perform operations independently of which concrete inventory the slots belong to.

<div class="highlight">
<pre><code><span class="c1">// InventoryInteraction.h</span>
<span class="cpp-macro">UCLASS</span><span class="p">()</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UInventoryInteraction</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">UObject</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

    <span class="c1">...</span>

<span class="k">private</span><span class="p">:</span>
    <span class="cpp-macro">UPROPERTY</span><span class="p">()</span>
    <span class="cpp-class">TObjectPtr</span><span class="o">&lt;</span><span class="cpp-class">UInventory</span><span class="o">&gt;</span> <span class="n">SourceInventory</span> <span class="o">=</span> <span class="k">nullptr</span><span class="p">;</span>

    <span class="cpp-class">EItemSelectOption</span> <span class="cpp-function">SelectClickOption</span><span class="p">(</span><span class="k">const</span> <span class="cpp-class">FInventoryClickContext</span><span class="o">&amp;</span> <span class="n">Context</span><span class="p">)</span> <span class="k">const</span><span class="p">;</span>

    <span class="k">void</span> <span class="cpp-function">DoClickOption</span><span class="p">(</span><span class="cpp-class">EItemSelectOption</span> <span class="n">Option</span><span class="p">,</span> <span class="k">const</span> <span class="cpp-class">FInventoryClickContext</span><span class="o">&amp;</span> <span class="n">Context</span><span class="p">,</span> <span class="cpp-class">UInventory</span><span class="o">*</span> <span class="n">Inventory</span><span class="p">);</span>

    <span class="k">bool</span> <span class="cpp-function">SplitStack</span><span class="p">(</span><span class="cpp-class">UInventory</span><span class="o">*</span> <span class="n">Inv</span><span class="p">,</span> <span class="k">int</span> <span class="n">Index</span><span class="p">);</span>

    <span class="k">void</span> <span class="cpp-function">HandleEmpty</span><span class="p">(</span><span class="cpp-class">UInventory</span><span class="o">*</span> <span class="n">Inv</span><span class="p">,</span> <span class="k">int</span> <span class="n">Index</span><span class="p">);</span>
    <span class="k">void</span> <span class="cpp-function">HandleStack</span><span class="p">(</span><span class="cpp-class">UInventory</span><span class="o">*</span> <span class="n">Inv</span><span class="p">,</span> <span class="k">int</span> <span class="n">Index</span><span class="p">);</span>
    <span class="k">void</span> <span class="cpp-function">HandleSwap</span><span class="p">(</span><span class="cpp-class">UInventory</span><span class="o">*</span> <span class="n">Inv</span><span class="p">,</span> <span class="k">int</span> <span class="n">Index</span><span class="p">);</span>
<span class="p">};</span></code></pre>
</div>

### 5. Coordinating Multiple Inventories

With multiple inventories came another problem: when picking up an item, it's not enough to check whether one specific inventory has room — you need to determine which of the available inventories can actually accept the item.

This decision was moved out of `UInventory` and into a `UPlayerInventoryManager`. The manager keeps track of the registered inventories and coordinates adding an item. It checks whether a matching stack or free slot exists, and delegates the actual inventory operation to the respective `UInventory`.

This keeps `UInventory` responsible for managing a single inventory, while the manager coordinates the collaboration between multiple inventories.

<div class="highlight">
<pre><code><span class="c1">// PlayerInventoryManager.h</span>
<span class="k">class</span> <span class="n">UInventory</span><span class="p">;</span>

<span class="cpp-macro">UCLASS</span><span class="p">()</span>
<span class="k">class</span> <span class="n">FARMINGGAME_API</span> <span class="cpp-class">UPlayerInventoryManager</span> <span class="p">:</span> <span class="k">public</span> <span class="cpp-class">UGameInstanceSubsystem</span>
<span class="p">{</span>
    <span class="cpp-macro">GENERATED_BODY</span><span class="p">()</span>

<span class="k">public</span><span class="p">:</span>
    <span class="k">void</span> <span class="cpp-function">RegisterInventory</span><span class="p">(</span><span class="cpp-class">EItemCollectionEventManagerTypes</span> <span class="n">EventManagerType</span><span class="p">,</span> <span class="cpp-class">UObject</span><span class="o">*</span> <span class="n">ObjectClassToSubscribe</span><span class="p">);</span>
    <span class="k">int</span> <span class="cpp-function">GiveItem</span><span class="p">(</span><span class="cpp-class">EItemID</span> <span class="n">ItemID</span><span class="p">,</span> <span class="k">int</span> <span class="n">Quantity</span><span class="p">);</span>
    <span class="cpp-class">UInventory</span><span class="o">*</span> <span class="cpp-function">GetInventory</span><span class="p">(</span><span class="cpp-class">EInventoryType</span> <span class="n">Type</span><span class="p">)</span> <span class="k">const</span><span class="p">;</span>

<span class="k">private</span><span class="p">:</span>
    <span class="cpp-macro">UPROPERTY</span><span class="p">()</span>
    <span class="cpp-class">TMap</span><span class="o">&lt;</span><span class="cpp-class">EInventoryType</span><span class="p">,</span> <span class="cpp-class">TObjectPtr</span><span class="o">&lt;</span><span class="cpp-class">UInventory</span><span class="o">&gt;&gt;</span> <span class="n">Inventories</span><span class="p">;</span>
<span class="p">};</span></code></pre>
</div>

## Conclusion

This project taught me that architecture has to grow with the system.

Time and again, the original solutions hit their limits as the feature set grew. Through targeted refactoring, I was able to separate responsibilities, reduce dependencies, and make systems more reusable.

For me, software development isn't just about designing new systems — it's also about critically questioning and evolving existing code.
