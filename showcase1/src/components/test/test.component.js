<state count="0" />

<action name="reset">
    count = 0;
</action>

<div>
    <@css container />
    <h1 @css title>Avenx Framework</h1>
    
    <div @css counter-box>
        <span @css text>Reactive Counter</span>
        <span @css count>{{ count }}</span>
    </div>

    <div @css button-group>
        <button @css btn-primary @click="count++">Increment</button>
        <button @css btn-secondary @click="reset()">Reset</button>
    </div>
</div>
