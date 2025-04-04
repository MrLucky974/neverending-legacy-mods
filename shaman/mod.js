G.AddData({
    name:'Shamans',
    author:'Luckius_',
    desc:'A mod that adds a new unit and new gameplay elements.',
    engineVersion:1,
    manifest: 0,
    requires:['Default dataset*'],
    sheets:{
        'shaman': 'https://mrlucky974.github.io/neverending-legacy-mods/shaman/iconSheet.png'
    },

    func:function() {

        //Adds medicine, a item used by the shaman to cure sick and wounded
        new G.Res({
            name:'medicine',
            desc:'[medicine] helps to heal the [sick] and the [wounded].',
            icon:[0,1,'shaman'],
            //turnToByContext:{'decay':{'medicine':0.3,}},
            //partOf:'food',
            category:'food',
        });

        //Adds the shaman, the most important unit from this mod
        new G.Unit({
            name:'shaman',
            desc:'@uses [medicine]s to heal the [sick] and the [wounded] with a greater success rate than the [healer].<>Produce [medicine] by combining [herb]s secret powers and the magic of spirits using [faith].<>',
            icon:[23,3],
            cost:{},
            use:{'worker':1},
            staff:{'knapped tools':1},
            upkeep:{'coin':0.2},
            gizmos: true,
            modes: {
                'heal':{name:'Heal', icon:[4,5], desc:'Heal the [sick] and the [wounded] with [medicine] and 1 [insight].'},
                'medicine':{name:'Make medicine', icon:[0,1,'shaman'], desc:'Produce 7 [medicine] from 3 [water] and 10 [herb]s.'},
                'youth':{name:'Cure elders',icon:[1,1,'shaman'], desc:'The [shaman] have a very small chance to cure [elder]s, them becoming [adult]s again.<>Use 20 [medicine], 1 [insight] & 3 [faith].'},
                'necromancy':{name:'Ressurect corpse', icon:[0,0,'shaman'], desc:'Using [necromancy], a [shaman] can ressurect [corpse, dead] people back to life, making a [zombie].<>Use 1 [faith].', req:{'necromancy':true}},
            },
            effects:[
                {type:'convert', from:{'sick':1, 'medicine':7, 'insight':1}, into:{'adult':1}, chance:1/2, every:1.5, mode:'heal'},
                {type:'convert', from:{'wounded':1, 'medicine':7, 'insight':1}, into:{'adult':1}, chance:1/3, every:5, mode:'heal'},
                {type:'convert', from:{'water':3, 'herb':10}, into:{'medicine':7}, every:3, mode:'medicine'},
                {type:'convert', from:{'elder':1, 'medicine':20, 'insight':1, 'faith':3}, into:{'adult':1}, chance:1/7, every:10, mode:'youth'},
                {type:'convert', from:{'corpse':1, 'faith':1}, into:{'zombie':1}, chance:1/4, every:10, mode:'necromancy'},
            ],
            req:{'healing':true, 'ritualism':true},
            category:'spiritual',
            priority:5,
        });

        //Adds necromancy technology
        new G.Tech({
            name:'necromancy',
            desc:'@unlocks new options for [shaman]s<>',
            icon:[0, 0, 'shaman'],
            cost:{'insight':10, 'faith':1},
            req:{'ritualism':true, 'burial':true, 'healing':true},
            effects:[
            ],
            chance:2,
        });

        //Adds the zombie
        new G.Res({
            name:'zombie',
            desc:'[zombie,Zombies] are [corpse]s bringed back to life by a [shaman] using [necromancy].//Zombies make are an addition to your [worker,workforce].<>Those who play with the power of life and death should be warned that one day themselves they could be the toy of their own grief...',
            //startWith:5,
            //visible:false,
            partOf:'worker',
            category:'demog',
            icon:[1, 0, 'shaman'],
            tick:function(me,tick)
		    {  
                if (me.amount>0)
			    {
                    if (tick%7==0)
				    {           
                        //eat food
                        var toConsume=me.amount*1;
                        var consumeMult=1;
                        toConsume=randomFloor(toConsume*consumeMult);
                        var consumed=G.lose('meat', toConsume, 'eating (zombie)');
                        G.lose('happiness', consumed*0.5, 'eating (zombie)');

                        var lacking=toConsume-consumed;
                        if (lacking>0) //Are we out of raw meat?
                        {
                            lacking=lacking-G.lose('spoiled food', lacking*50, 'eating (zombie)')/50;

                            if (lacking > 0) //Are we also out of spoiled food?
                            {   
                                var humansEaten = Math.min(2, lacking);
                                lacking=lacking-G.lose('adult', humansEaten, 'eating (zombie)')*5;
                                G.lose('happiness', humansEaten*2.0, 'eating (zombie)');
                                G.getRes('died this year').amount+=humansEaten;
                                if (humansEaten>0) G.Message({type:'bad', mergeId:'diedEaten', textFunc:function(args){return B(args.died)+' '+(args.died==1?'person':'people')+' died eaten by zombies.';}, args:{died:humansEaten}, icon:[5,4]});

                                if (lacking > 0) //Humans are not enough?
                                {         
                                    var died = toConsume;
                                    G.gain('corpse', died, 'starvation (zombie)');
                                    G.lose('zombie', died, 'starvation (zombie)');
                                    G.gain('happiness',died*5,'starvation (zombie)');
                                    G.getRes('died this year').amount+=died;
                                    if (died>0) G.Message({type:'bad', mergeId:'diedStarvation', textFunc:function(args){return B(args.died)+' '+(args.died==1?'zombie':'zombies')+' died from starvation.';}, args:{died:died}, icon:[5,4]});         
                                }
                            } 
                        }  
                    } 
                }   
            }
        });

        //Creatures category
        if ('creatures' in G.resCategories) G.resCategories['creatures'].base.push('zombie'); //Check for a creatures category
        else G.resCategories['creatures'] = {name: 'Creatures', base: ['zombie'], side: []}; //If this category doesn't exists, create one, and put the golem in there

    }

});