from abc import ABC, abstractmethod

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.skills = {}

    def add_skill(self, skill_name: str, skill_func):
        self.skills[skill_name] = skill_func

    @abstractmethod
    async def execute(self, *args, **kwargs):
        pass

class Agent(BaseAgent):
    """
    A generic agent that can execute its registered skills.
    """
    async def execute(self, skill_name: str, *args, **kwargs):
        if skill_name in self.skills:
            return await self.skills[skill_name](*args, **kwargs)
        else:
            raise ValueError(f"Skill '{skill_name}' not found for agent '{self.name}'")

class OrchestratorAgent(BaseAgent):
    """
    An orchestrator agent responsible for delegating tasks to sub-agents.
    """
    def __init__(self, name: str):
        super().__init__(name)
        self.sub_agents = {}

    def add_sub_agent(self, sub_agent_name: str, agent_instance: BaseAgent):
        self.sub_agents[sub_agent_name] = agent_instance

    @abstractmethod
    async def execute(self, *args, **kwargs):
        pass
