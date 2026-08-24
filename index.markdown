---
layout: home
title: Survival Spiel
---

<div class="project-meta">

  <div class="meta-item">
    <span>Begin</span>
    <strong class="meta-value">08/2024</strong>
  </div>

<div class="meta-item">
  <span>EIGENER C++-CODE</span>
  <strong class="meta-value meta-value-wrap">
    <span class="meta-approx">ca.</span>
    <span class="count-up" data-target="7500">0</span>
  </strong>
  <strong class="meta-suffix">Zeilen</strong>
</div>

  <div class="meta-item">
    <span>Programmiersprache</span>
    <strong class="meta-value">C++</strong>
  </div>

  <div class="meta-item">
    <span>Engine</span>
    <strong class="meta-value">Unreal Engine 5</strong>
  </div>

</div>

> **Hinweis zum Quellcode.**  
> Da sich das Projekt in aktiver Entwicklung befindet und langfristig veröffentlicht werden soll, ist der vollständige Quellcode nicht öffentlich. Die gezeigten Ausschnitte stammen aus dem produktiven Projekt und wurden auf die für dieses Portfolio relevanten Architekturentscheidungen reduziert.

## Überblick

Seit August 2024 entwickle ich eigenständig ein Survival-Spiel mit Unreal Engine 5 und C++. Aus einem zunächst kleinen Lernprojekt entstand dabei ein umfangreiches Softwaresystem mit ca. 7.500 Zeilen eigenem C++-Code.

Mit wachsendem Funktionsumfang stiegen auch die Anforderungen an die Architektur. Bestehende Systeme wurden deshalb mehrfach refaktoriert, um Verantwortlichkeiten klarer zu trennen, direkte Abhängigkeiten zu reduzieren und Komponenten wiederverwendbar zu machen.

Ein zentraler Teil des Projekts ist dabei die kontinuierliche Weiterentwicklung der Architektur: Entscheidungen werden nicht nur nach ihrer aktuellen Funktionalität bewertet, sondern auch danach, wie gut sie sich unter wachsender Komplexität erweitern und warten lassen.

## Architektur

### Von Klassenexplosion zu datengetriebenem Design

Im Initial Commit war jede Ressource im Spiel eine eigene Actor-Subklasse. `ACoal`, `AIron`, `AGold`, `ADiamond`, `AStone` und `ATree` erbten alle von `ACollect` und unterschieden sich nur durch fest verdrahtete Konstruktor-Parameter:

<div class="highlight">
<pre><code><span class="c1">// Tree.cpp</span>
<span class="cp">#include</span> <span class="s">"Tree.h"</span>

<span class="cpp-class">ATree</span><span class="p">::</span><span class="cpp-function">ATree</span><span class="p">()</span>
    <span class="p">:</span> <span class="cpp-class">ACollect</span><span class="p">(</span><span class="cpp-class">ECollectables</span><span class="p">::</span><span class="cpp-class">Tree</span><span class="p">,</span> <span class="cpp-class">EItemID</span><span class="p">::</span><span class="n">wood</span><span class="p">,</span> <span class="mi">32</span><span class="p">)</span> <span class="p">{</span> <span class="p">}</span>

<span class="p">...</span></code></pre>
</div>

Sechs praktisch identische Klassen, deren einziger Unterschied drei hartcodierte Werte im Konstruktor sind – jede neue Ressource bedeutete eine neue C++-Klasse plus Blueprint.

Bereits im zweiten Commit sind diese Subklassen verschwunden. Stattdessen gibt es eine einzige, parametrisierte `ACollect`-Klasse, die über einen Enum-Typ (`ECollectables`) und eine `FCollectable`-Struktur beschrieben wird:

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

Neue Ressourcentypen benötigen seitdem keine eigene C++-Klasse mehr, sondern werden über die vorhandene Struktur und Daten konfiguriert.

![Beschreibung des Bildes](assets/images/Collectable.PNG)

### Verantwortlichkeiten durch Components trennen

Wiederverwendbare Verantwortlichkeiten wurden in eigene Komponentenklassen ausgelagert, die sich an beliebige Objekte im Spiel anhängen lassen. Die Verantwortlichkeiten wurden gezielt auf separate Komponenten aufgeteilt, sodass die einzelnen Funktionen unabhängig voneinander wiederverwendet werden können.

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

`UCollectableComponent` kapselt ausschließlich die Collectable-Daten eines Objekts, `UProgressComponent` ausschließlich die Fortschrittsanzeige beim Abbauen. Beide sind unabhängig voneinander wiederverwendbar, ohne dass ein Objekt, das nur eine der beiden Funktionen braucht, die andere mitschleppen muss.

### Auflösung eines "God-Managers" in fokussierte Subsysteme

Damit mehrere Systeme miteinander kommunizieren können, wurde ein `UItemCollectionManager` eingeführt. Mit der Zeit wuchs er jedoch zu einer God-Class heran, da er direkte Abhängigkeiten zu Character-, Controller-, Equipment-, Inventory- und Collect-Klassen besaß:

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

Durch ein Refactoring wurde der `UItemCollectionManager` aufgeteilt in einen `UEquipmentManager` (reine Equipment-Logik) und einen `UPlayerInventoryManager` (reine Inventar-Verwaltung). Dadurch wurden die Verantwortlichkeiten klar getrennt und direkte Abhängigkeiten zwischen den beteiligten Systemen reduziert.

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

Durch eventbasierte Kommunikation habe ich direkte Abhängigkeiten zwischen den beteiligten Subsystemen reduziert. Das Inventory-System muss seine Konsumenten nicht mehr kennen: Es veröffentlicht Änderungen über Delegates, auf die interessierte Systeme und Widgets unabhängig reagieren können. Das reduziert die direkte Kopplung zwischen den beteiligten Systemen.

<div class="highlight">
<pre><code><span class="cpp-macro">DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam</span><span class="p">(</span><span class="cpp-class">FOnInventoryChanged</span><span class="p">,</span> <span class="k">const</span> <span class="cpp-class">TArray</span><span class="o">&lt;</span><span class="cpp-class">FItem</span><span class="o">&gt;&amp;</span><span class="p">,</span> <span class="n">Inventory</span><span class="p">);</span></code></pre>
</div>

`UEquipmentManager` und `UPlayerInventoryManager` kennen sich dadurch nicht gegenseitig. Beide reagieren lediglich auf relevante Events, die beispielsweise vom Inventory oder der Hotbar ausgelöst werden. Änderungen an einem System können dadurch erfolgen, ohne die abhängigen Systeme direkt anpassen zu müssen.

## Die größte Herausforderung

Das Inventory-System entwickelte sich zum komplexesten zusammenhängenden Teil des Projekts. Mit wachsendem Funktionsumfang kamen neben der eigentlichen Inventarverwaltung auch Interaktionslogik, eine Hotbar und mehrere UI-Komponenten hinzu. In der ursprünglichen Architektur lagen diese Verantwortlichkeiten weitgehend in einer Klasse und waren dadurch stark miteinander gekoppelt.

Um die entstehende Komplexität zu reduzieren, wurde das System in mehreren Schritten refaktoriert.

### 1. Entkopplung der UI durch Events

Zunächst wurde die direkte Abhängigkeit zwischen Inventory und UI entfernt. Das Inventory veröffentlicht Änderungen über Events, auf die die Widgets reagieren.

Dadurch kennt das Inventory seine UI-Konsumenten nicht mehr und die Darstellung kann unabhängig von der Datenhaltung weiterentwickelt werden.

<div class="highlight">
<pre><code><span class="n">MyInventory</span><span class="o">-&gt;</span><span class="n">OnInventoryChanged</span><span class="p">.</span><span class="cpp-function">AddDynamic</span><span class="p">(</span> <span class="k">this</span><span class="p">,</span> <span class="o">&amp;</span><span class="cpp-class">UInventoryWidget</span><span class="o">::</span><span class="cpp-function">PopulateInventory</span> <span class="p">);</span></code></pre>
</div>

### 2. Separate Hotbar durch Spezialisierung

Die Hotbar verwendet die gemeinsame Inventarlogik von `UInventory`, benötigt aber zusätzliche Regeln für die aktive Slot-Auswahl und das Scrollverhalten.

Statt diese Sonderfälle in `UInventory` zu integrieren, wurde `UHotbar` als Spezialisierung von `UInventory` eingeführt. Die gemeinsame Funktionalität bleibt dadurch zentral in der Basisklasse, während die Hotbar nur ihr spezifisches Verhalten ergänzt.

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

### 3. Zentraler Datenzugriff über DataTableManager

Mit zunehmender Anzahl an Systemen stieg auch die Anzahl der benötigten DataTables. Statt die Tabellen in verschiedenen Klassen einzeln zu referenzieren und zu laden, wurde ein zentraler `UDataTableManager` eingeführt.

Der Manager stellt eine einheitliche Schnittstelle für den Zugriff auf unterschiedliche Tabellen bereit. Die DataTables werden beim ersten Zugriff geladen und anschließend für die Lebensdauer der `GameInstance` gecached. Dadurch müssen die einzelnen Systeme weder wissen, wo die Tabellen konfiguriert sind, noch sich um deren Lade- und Cache-Zustand kümmern.

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

Durch die Template-basierte Schnittstelle kann derselbe Zugriff für unterschiedliche Row-Typen verwendet werden:

<div class="highlight">
<pre><code><span class="k">const</span> <span class="cpp-class">FItem</span><span class="o">*</span> <span class="n">Item</span> <span class="o">=</span> <span class="cpp-class">DataTableManager</span><span class="o">-&gt;</span><span class="cpp-function">FindRow</span><span class="o">&lt;</span><span class="cpp-class">FItem</span><span class="o">&gt;</span><span class="p">(</span><span class="cpp-class">EDataTable</span><span class="o">::</span><span class="n">Items</span><span class="p">,</span> <span class="cpp-class">EItemID</span><span class="o">::</span><span class="n">wood</span><span class="p">);</span></code></pre>
</div>

Damit bleibt der konkrete Zugriff auf DataTables von den Gameplay-Systemen getrennt und erfolgt über eine zentrale, einheitliche API.
<br>
<br>
#### Beispiel: Item-Daten

<div style="display: flex; gap: 20px; align-items: flex-start;">

    <!-- Linke Seite: Code -->
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

    <!-- Rechte Seite: Bild -->
    <div style="width: 50%;">
        <img src="assets/images/Brown_Cap.PNG" alt="Beschreibung" style="width: 100%; height: auto;">
    </div>

</div>

### 4. Auslagerung der Interaktionslogik

Ein weiterer Problembereich war die eigentliche Interaktion mit Items: Verschieben, Stapeln, Aufteilen und Tauschen.

Diese Logik lag ursprünglich direkt im Inventory. Dadurch war die Interaktion auf ein einzelnes Inventar zugeschnitten. Ein Item zwischen Spielerinventar und Hotbar oder zwischen zwei beliebigen Inventaren zu verschieben, erforderte zusätzliche Sonderfälle.

Die Interaktionslogik wurde deshalb in `UInventoryInteraction` ausgelagert. Die Klasse arbeitet mit dem jeweils betroffenen `UInventory` und kann dadurch Operationen unabhängig davon ausführen, welchem konkreten Inventar die Slots gehören.

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

### 5. Koordination mehrerer Inventare

Mit mehreren Inventaren entstand ein weiteres Problem: Beim Aufsammeln eines Items muss nicht nur geprüft werden, ob ein bestimmtes Inventar Platz bietet, sondern welches der verfügbaren Inventare das Item aufnehmen kann.

Diese Entscheidung wurde aus `UInventory` herausgehalten und in einen `UPlayerInventoryManager` ausgelagert. Der Manager verwaltet die registrierten Inventare und koordiniert das Hinzufügen eines Items. Er prüft, ob ein passender Stack oder freier Slot vorhanden ist, und delegiert die eigentliche Inventaroperation an das jeweilige `UInventory`.

Damit bleibt `UInventory` für die Verwaltung eines einzelnen Inventars verantwortlich, während der Manager die Zusammenarbeit mehrerer Inventare koordiniert.

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

## Fazit

Das Projekt hat mir gezeigt, dass Architektur mit dem System wachsen muss.

Mehrfach stießen ursprüngliche Lösungen mit wachsendem Funktionsumfang an ihre Grenzen. Durch gezielte Refactorings konnten Verantwortlichkeiten getrennt, Abhängigkeiten reduziert und Systeme wiederverwendbarer gemacht werden.

Für mich gehört deshalb nicht nur das Entwerfen neuer Systeme zur Softwareentwicklung, sondern auch das kritische Hinterfragen und Weiterentwickeln bestehenden Codes.
